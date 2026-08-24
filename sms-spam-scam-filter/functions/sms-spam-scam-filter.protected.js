/* eslint-disable camelcase */

const DEFAULT_MODEL = 'gpt-5.6-luna';
const DEFAULT_TIMEOUT_MS = 7000;
const MAX_SMS_CHARS_SENT_TO_MODEL = 2000;

function buildPrompt(event) {
  const body = String(event.Body || '').slice(0, MAX_SMS_CHARS_SENT_TO_MODEL);

  return {
    from: event.From || null,
    to: event.To || null,
    body,
    numMedia: event.NumMedia || '0',
  };
}

function buildOpenAIRequestBody(model, event) {
  return {
    model,
    store: false,
    max_output_tokens: 120,
    reasoning: {
      effort: 'none',
    },
    input: [
      {
        role: 'system',
        content: [
          {
            type: 'input_text',
            text: [
              'Classify an inbound SMS as either spam/scam or genuine.',
              'Spam/scam includes phishing, impersonation, fake delivery/banking notices, credential harvesting, prize scams, investment scams, malware links, and unsolicited promotional spam.',
              'Genuine includes expected personal, operational, customer, appointment, account, support, or transactional messages.',
              'Prefer spam_scam when the message is unsolicited and asks for money, credentials, urgent action, or link clicks.',
              'Return only the requested JSON schema.',
            ].join(' '),
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: JSON.stringify(buildPrompt(event)),
          },
        ],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'sms_spam_classification',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['classification', 'confidence', 'reason'],
          properties: {
            classification: {
              type: 'string',
              enum: ['spam_scam', 'genuine'],
            },
            confidence: {
              type: 'number',
              minimum: 0,
              maximum: 1,
            },
            reason: {
              type: 'string',
            },
          },
        },
      },
    },
  };
}

function loadOpenAI() {
  const OpenAI = require('openai');
  return OpenAI.default || OpenAI;
}

function extractResponseText(response) {
  if (typeof response.output_text === 'string') {
    return response.output_text;
  }

  if (!Array.isArray(response.output)) {
    return '';
  }

  return response.output
    .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
    .map((content) => content.text || '')
    .join('');
}

function parseClassification(response) {
  const text = extractResponseText(response).trim();

  if (!text) {
    throw new Error('OpenAI response did not include output text');
  }

  const parsed = JSON.parse(text);

  if (!['spam_scam', 'genuine'].includes(parsed.classification)) {
    throw new Error(`Unexpected classification: ${parsed.classification}`);
  }

  return parsed;
}

async function callOpenAIClassifier(context, event, OpenAIOverride) {
  const apiKey = context.OPENAI_API_KEY;
  const model = context.OPENAI_MODEL || DEFAULT_MODEL;
  const timeoutMs = Number(context.OPENAI_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
  const requestTimeoutMs =
    Number.isFinite(timeoutMs) && timeoutMs > 0
      ? timeoutMs
      : DEFAULT_TIMEOUT_MS;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required');
  }

  const OpenAI = OpenAIOverride || loadOpenAI();
  const client = new OpenAI({
    apiKey,
    timeout: requestTimeoutMs,
    maxRetries: 0,
  });

  const response = await client.responses.create(
    buildOpenAIRequestBody(model, event),
    {
      timeout: requestTimeoutMs,
      maxRetries: 0,
    }
  );

  return parseClassification(response);
}

function createHandler(classifier) {
  return async function smsSpamScamFilter(context, event, callback) {
    const twiml = new Twilio.twiml.MessagingResponse();
    const forwardUrl = context.FORWARD_WEBHOOK_URL;
    const forwardMethod = context.FORWARD_WEBHOOK_METHOD || 'POST';

    if (!forwardUrl) {
      console.error('FORWARD_WEBHOOK_URL is required');
      return callback(null, twiml);
    }

    if (!event.Body || !String(event.Body).trim()) {
      console.log('Blocked SMS with empty body');
      return callback(null, twiml);
    }

    try {
      const result = await classifier(context, event);
      console.log(
        `SMS classification: ${result.classification} (${result.confidence})`
      );

      if (result.classification === 'genuine') {
        twiml.redirect({ method: forwardMethod }, forwardUrl);
      }

      return callback(null, twiml);
    } catch (err) {
      console.error(`SMS classification failed: ${err.message}`);
      return callback(null, twiml);
    }
  };
}

exports.handler = createHandler(callOpenAIClassifier);

exports._test = {
  buildOpenAIRequestBody,
  callOpenAIClassifier,
  createHandler,
  extractResponseText,
  loadOpenAI,
  parseClassification,
};
