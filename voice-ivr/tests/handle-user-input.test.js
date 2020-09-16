const helpers = require('../../test/test-helper');
const handleUserInput = require('../functions/handle-user-input.protected')
  .handler;
const Twilio = require('twilio');

let shouldFail = false;
const mockTwilioClient = {
  messages: {
    create: jest.fn(() => {
      if (shouldFail) {
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
  const callback = (err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
    done();
  };

  handleUserInput(context, baseEvent, callback);
});

describe('handles digit inputs', () => {
  test('responds to 1', (done) => {
    let event = { ...baseEvent, Digits: '1' };

    const callback = (err, result) => {
      const twiml = result.toString();
      expect(twiml).toMatch(
        '<Response><Say>You have not configured forwarding yet. Please find this section in your code and add a phone number</Say></Response>'
      );
      expect(mockTwilioClient.messages.create).not.toHaveBeenCalled();
      done();
    };

    handleUserInput(context, event, callback);
  });

  test('responds to 2', (done) => {
    let event = { ...baseEvent, Digits: '2' };

    const callback = (err, result) => {
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
    let event = { ...baseEvent, Digits: '3' };

    const callback = (err, result) => {
      const twiml = result.toString();
      expect(twiml).toMatch(
        '<Response><Say>We will send you a text message with our address in a minute.</Say></Response>'
      );
      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
        from: baseEvent.To,
        to: baseEvent.From,
        body:
          'Here is our address: 375 Beale St #300, San Francisco, CA 94105, USA',
      });
      done();
    };

    handleUserInput(context, event, callback);
  });

  test('responds to unknown digits', (done) => {
    let event = { ...baseEvent, Digits: '5' };

    const callback = (err, result) => {
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
    let event = { ...baseEvent, SpeechResult: 'I want to talk to sales' };

    const callback = (err, result) => {
      const twiml = result.toString();
      expect(twiml).toMatch(
        '<Response><Say>You have not configured forwarding yet. Please find this section in your code and add a phone number</Say></Response>'
      );
      expect(mockTwilioClient.messages.create).not.toHaveBeenCalled();
      done();
    };

    handleUserInput(context, event, callback);
  });

  test('responds to opening hours', (done) => {
    let event = { ...baseEvent, SpeechResult: 'What are your opening hours' };

    const callback = (err, result) => {
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
    let event = {
      ...baseEvent,
      SpeechResult: 'what address are you located at',
    };

    const callback = (err, result) => {
      const twiml = result.toString();
      expect(twiml).toMatch(
        '<Response><Say>We will send you a text message with our address in a minute.</Say></Response>'
      );
      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
        from: baseEvent.To,
        to: baseEvent.From,
        body:
          'Here is our address: 375 Beale St #300, San Francisco, CA 94105, USA',
      });
      done();
    };

    handleUserInput(context, event, callback);
  });

  test('responds to unknown text', (done) => {
    let event = { ...baseEvent, SpeechResult: 'Not saying anyting relevant' };

    const callback = (err, result) => {
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
    let event = { ...baseEvent, Digits: '3' };

    const callback = (err, result) => {
      expect(err).toEqual(null);
      const twiml = result.toString();
      expect(twiml).toMatch(
        '<Response><Say>We will send you a text message with our address in a minute.</Say></Response>'
      );
      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
        from: baseEvent.To,
        to: baseEvent.From,
        body:
          'Here is our address: 375 Beale St #300, San Francisco, CA 94105, USA',
      });
      done();
    };

    handleUserInput(context, event, callback);
  });
});
