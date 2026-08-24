/* eslint-disable camelcase */

const helpers = require('../../test/test-helper');

const smsSpamScamFilter =
  require('../functions/sms-spam-scam-filter.protected').handler;
const { _test } = require('../functions/sms-spam-scam-filter.protected');

const context = {
  FORWARD_WEBHOOK_URL: 'https://example.com/twilio/inbound-sms',
  FORWARD_WEBHOOK_METHOD: 'POST',
};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

function invoke(handler, event, contextOverride) {
  return new Promise((resolve, reject) => {
    handler(contextOverride || context, event, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(result);
    });
  });
}

test('returns an empty MessagingResponse for empty messages', async () => {
  const twiml = await invoke(smsSpamScamFilter, { Body: '' });

  expect(twiml.toString()).toBe(
    '<?xml version="1.0" encoding="UTF-8"?><Response/>'
  );
});

test('redirects genuine messages to the configured webhook', async () => {
  const handler = _test.createHandler(async () => ({
    classification: 'genuine',
    confidence: 0.93,
    reason: 'Expected support message.',
  }));

  const twiml = await invoke(handler, {
    Body: 'Can you call me about ticket 123?',
  });

  expect(twiml.toString()).toBe(
    '<?xml version="1.0" encoding="UTF-8"?><Response><Redirect method="POST">https://example.com/twilio/inbound-sms</Redirect></Response>'
  );
});

test('does not redirect spam or scam messages', async () => {
  const handler = _test.createHandler(async () => ({
    classification: 'spam_scam',
    confidence: 0.98,
    reason: 'Credential phishing.',
  }));

  const twiml = await invoke(handler, {
    Body: 'Your bank is locked. Verify now at http://bad.example',
  });

  expect(twiml.toString()).toBe(
    '<?xml version="1.0" encoding="UTF-8"?><Response/>'
  );
});

test('does not redirect when classification fails', async () => {
  const handler = _test.createHandler(async () => {
    throw new Error('network unavailable');
  });

  const twiml = await invoke(handler, { Body: 'Hi, are you available?' });

  expect(twiml.toString()).toBe(
    '<?xml version="1.0" encoding="UTF-8"?><Response/>'
  );
});

test('does not redirect when the forwarding webhook is missing', async () => {
  const handler = _test.createHandler(async () => ({
    classification: 'genuine',
    confidence: 0.99,
    reason: 'Expected message.',
  }));

  const twiml = await invoke(handler, { Body: 'Hi there' }, {});

  expect(twiml.toString()).toBe(
    '<?xml version="1.0" encoding="UTF-8"?><Response/>'
  );
});

test('parses structured output from the Responses API', () => {
  const parsed = _test.parseClassification({
    output_text: JSON.stringify({
      classification: 'genuine',
      confidence: 0.85,
      reason: 'Conversation-like message.',
    }),
  });

  expect(parsed.classification).toBe('genuine');
});

test('extracts structured output from nested response content', () => {
  const outputText = _test.extractResponseText({
    output: [
      {
        content: [
          {
            text: JSON.stringify({
              classification: 'spam_scam',
              confidence: 0.8,
              reason: 'Promotional link.',
            }),
          },
        ],
      },
    ],
  });

  expect(JSON.parse(outputText).classification).toBe('spam_scam');
});

test('returns empty output text when the Responses API output is absent', () => {
  expect(_test.extractResponseText({})).toBe('');
});

test('rejects structured output without response text', () => {
  expect(() => _test.parseClassification({})).toThrow(
    'OpenAI response did not include output text'
  );
});

test('rejects unexpected classifications', () => {
  expect(() =>
    _test.parseClassification({
      output_text: JSON.stringify({
        classification: 'unknown',
        confidence: 0.1,
        reason: 'Invalid test value.',
      }),
    })
  ).toThrow('Unexpected classification: unknown');
});

test('uses gpt-5.6-luna and a strict spam classification schema', () => {
  const body = _test.buildOpenAIRequestBody('gpt-5.6-luna', {
    From: '+15551234567',
    To: '+15557654321',
    Body: 'Delivery failed. Pay a fee now.',
  });

  expect(body.model).toBe('gpt-5.6-luna');
  expect(body.text.format.strict).toBe(true);
  expect(body.text.format.schema.properties.classification.enum).toEqual([
    'spam_scam',
    'genuine',
  ]);
});

test('loads the OpenAI SDK constructor', () => {
  expect(typeof _test.loadOpenAI()).toBe('function');
});

test('classifies through the OpenAI SDK responses API', async () => {
  const calls = [];

  class FakeOpenAI {
    constructor(options) {
      calls.push({ type: 'constructor', options });
      this.responses = {
        create: async (body, options) => {
          calls.push({ type: 'responses.create', body, options });
          return {
            output_text: JSON.stringify({
              classification: 'spam_scam',
              confidence: 0.91,
              reason: 'Fake delivery phishing.',
            }),
          };
        },
      };
    }
  }

  const result = await _test.callOpenAIClassifier(
    {
      OPENAI_API_KEY: 'test-key',
      OPENAI_MODEL: 'gpt-5.6-luna',
      OPENAI_TIMEOUT_MS: '1234',
    },
    {
      From: '+15551234567',
      To: '+15557654321',
      Body: 'Delivery failed. Pay a fee now.',
    },
    FakeOpenAI
  );

  expect(result.classification).toBe('spam_scam');
  expect(calls[0]).toEqual({
    type: 'constructor',
    options: {
      apiKey: 'test-key',
      timeout: 1234,
      maxRetries: 0,
    },
  });
  expect(calls[1].type).toBe('responses.create');
  expect(calls[1].body.model).toBe('gpt-5.6-luna');
  expect(calls[1].options).toEqual({
    timeout: 1234,
    maxRetries: 0,
  });
});

test('uses default model and timeout when context values are absent', async () => {
  const calls = [];

  class FakeOpenAI {
    constructor(options) {
      calls.push({ type: 'constructor', options });
      this.responses = {
        create: async (body, options) => {
          calls.push({ type: 'responses.create', body, options });
          return {
            output_text: JSON.stringify({
              classification: 'genuine',
              confidence: 0.91,
              reason: 'Expected message.',
            }),
          };
        },
      };
    }
  }

  const result = await _test.callOpenAIClassifier(
    {
      OPENAI_API_KEY: 'test-key',
      OPENAI_TIMEOUT_MS: 'not-a-number',
    },
    {
      Body: 'Can you call me back?',
    },
    FakeOpenAI
  );

  expect(result.classification).toBe('genuine');
  expect(calls[0].options.timeout).toBe(7000);
  expect(calls[1].body.model).toBe('gpt-5.6-luna');
  expect(calls[1].options.timeout).toBe(7000);
});

test('requires an OpenAI API key', async () => {
  await expect(
    _test.callOpenAIClassifier({}, { Body: 'Hello' })
  ).rejects.toThrow('OPENAI_API_KEY is required');
});
