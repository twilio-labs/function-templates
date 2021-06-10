const helpers = require('../../test/test-helper');
const handleUserInput =
  require('../functions/handle-user-input.protected').handler;
const Twilio = require('twilio');

let shouldFail = false;
const mockTwilioClient = {
  messages: {
    create: jest.fn(() => {
      if (shouldFail) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject('Expected test error');
      }
      return Promise.resolve({
        sid: 'my-new-sid',
      });
    }),
  },
};

const context = {
  getTwilioClient: () => mockTwilioClient,
  MY_PHONE_NUMBER: 'TwilioNumber',
};
const baseEvent = {
  From: '+12223334444',
  To: '+13334445555',
};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

beforeEach(() => {
  shouldFail = false;
  mockTwilioClient.messages.create.mockClear();
});

test('returns a VoiceResponse', (done) => {
  const callback = (_err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
    done();
  };

  handleUserInput(context, baseEvent, callback);
});

describe('handles digit inputs', () => {
  test('responds to 1', (done) => {
    const event = { ...baseEvent, Digits: '1' };

    const callback = (_err, result) => {
      const twiml = result.toString();
      expect(twiml).toMatch(
        `<Response><Say>Thank you. You will now be forwarded to our sales department.</Say><Dial>${context.MY_PHONE_NUMBER}</Dial></Response>`
      );
      expect(mockTwilioClient.messages.create).not.toHaveBeenCalled();
      done();
    };

    handleUserInput(context, event, callback);
  });

  test('responds to 2', (done) => {
    const event = { ...baseEvent, Digits: '2' };

    const callback = (_err, result) => {
      const twiml = result.toString();
      expect(twiml).toMatch(
        '<Response><Say>We are open from 9am to 5pm every day but Sunday.</Say></Response>'
      );
      expect(mockTwilioClient.messages.create).not.toHaveBeenCalled();
      done();
    };

    handleUserInput(context, event, callback);
  });

  test('responds to 3', (done) => {
    const event = { ...baseEvent, Digits: '3' };

    const callback = (_err, result) => {
      const twiml = result.toString();
      expect(twiml).toMatch(
        '<Response><Say>We will send you a text message with our address in a minute.</Say></Response>'
      );
      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
        from: baseEvent.To,
        to: baseEvent.From,
        body: 'Here is our address: 375 Beale St #300, San Francisco, CA 94105, USA',
      });
      done();
    };

    handleUserInput(context, event, callback);
  });

  test('responds to unknown digits', (done) => {
    const event = { ...baseEvent, Digits: '5' };

    const callback = (_err, result) => {
      const twiml = result.toString();
      expect(twiml).toMatch(
        '<Response><Say>We are sorry, we did not recognize your option. Please try again.</Say><Redirect>voice-ivr</Redirect></Response>'
      );
      expect(mockTwilioClient.messages.create).not.toHaveBeenCalled();
      done();
    };

    handleUserInput(context, event, callback);
  });
});

describe('handles speech inputs', () => {
  test('responds to sales', (done) => {
    const event = { ...baseEvent, SpeechResult: 'I want to talk to sales' };

    const callback = (_err, result) => {
      const twiml = result.toString();
      expect(twiml).toMatch(
        `<Response><Say>Thank you. You will now be forwarded to our sales department.</Say><Dial>${context.MY_PHONE_NUMBER}</Dial></Response>`
      );
      expect(mockTwilioClient.messages.create).not.toHaveBeenCalled();
      done();
    };

    handleUserInput(context, event, callback);
  });

  test('responds to opening hours', (done) => {
    const event = { ...baseEvent, SpeechResult: 'What are your opening hours' };

    const callback = (_err, result) => {
      const twiml = result.toString();
      expect(twiml).toMatch(
        '<Response><Say>We are open from 9am to 5pm every day but Sunday.</Say></Response>'
      );
      expect(mockTwilioClient.messages.create).not.toHaveBeenCalled();
      done();
    };

    handleUserInput(context, event, callback);
  });

  test('responds to address', (done) => {
    const event = {
      ...baseEvent,
      SpeechResult: 'what address are you located at',
    };

    const callback = (_err, result) => {
      const twiml = result.toString();
      expect(twiml).toMatch(
        '<Response><Say>We will send you a text message with our address in a minute.</Say></Response>'
      );
      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
        from: baseEvent.To,
        to: baseEvent.From,
        body: 'Here is our address: 375 Beale St #300, San Francisco, CA 94105, USA',
      });
      done();
    };

    handleUserInput(context, event, callback);
  });

  test('responds to unknown text', (done) => {
    const event = { ...baseEvent, SpeechResult: 'Not saying anyting relevant' };

    const callback = (_err, result) => {
      const twiml = result.toString();
      expect(twiml).toMatch(
        '<Response><Say>We are sorry, we did not recognize your option. Please try again.</Say><Redirect>voice-ivr</Redirect></Response>'
      );
      expect(mockTwilioClient.messages.create).not.toHaveBeenCalled();
      done();
    };

    handleUserInput(context, event, callback);
  });
});

describe('handles sms sending', () => {
  test('ignores errors thrown during sending an SMS', (done) => {
    shouldFail = true;
    const event = { ...baseEvent, Digits: '3' };

    const callback = (err, result) => {
      expect(err).toEqual(null);
      const twiml = result.toString();
      expect(twiml).toMatch(
        '<Response><Say>We will send you a text message with our address in a minute.</Say></Response>'
      );
      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
        from: baseEvent.To,
        to: baseEvent.From,
        body: 'Here is our address: 375 Beale St #300, San Francisco, CA 94105, USA',
      });
      done();
    };

    handleUserInput(context, event, callback);
  });
});
