const relaySms = require('../functions/relay-sms.protected').handler;
const helpers = require('../../test/test-helper');

let shouldFail = false;
const mockTwilioClient = {
  messages: {
    create: jest.fn(() => {
      if (shouldFail) {
        return Promise.reject(new Error('Expected test error'));
      }

      return Promise.resolve({
        sid: 'my-new-sid',
      });
    }),
  },
};

const context = {
  getTwilioClient: () => mockTwilioClient,
  MY_PHONE_NUMBER: '+12223334444',
};

const baseEvent = {
  From: context.MY_PHONE_NUMBER,
  To: '+13334445555',
  Body: '+16667778888: test message',
};

// Define your constant error messages here
const ERROR_MESSAGE = 'There was an issue with the phone number you entered; please verify it is correct and try again.';
const NO_RECIPIENT_ERROR = 'You need to specify a recipient number and a ":" before the message. For example, "+12223334444: message".';

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

describe('masked-number function template', () => {
  it('should send a message to a given phone number', async () => {
    const event = { ...baseEvent };
    const callback = (err, _result) => {
      expect(err).toBeFalsy();
      expect(mockTwilioClient.messages.create).toHaveBeenCalled();
    };

    await relaySms(context, event, callback);
  });

  it('should relay messages from other phone numbers', (done) => {
    const event = { ...baseEvent, From: baseEvent.To, Body: 'test message' };
    const callback = (err, result) => {
      expect(err).toBeFalsy();
      const twiml = result.toString();
      expect(twiml).toMatch(
        `<Message to="${context.MY_PHONE_NUMBER}">${event.From}: ${event.Body}</Message>`
      );

      done();
    };

    relaySms(context, event, callback);
  });

  it('should reject messages without a recipient specified', (done) => {
    const event = { ...baseEvent, Body: 'no recipient specified' };
    const callback = (err, result) => {
      expect(err).toBeFalsy();
      const twiml = result.toString();
      expect(twiml).toMatch(
        `<Message>${NO_RECIPIENT_ERROR}</Message>`
      );

      done();
    };

    relaySms(context, event, callback);
  });

  it('should send an error text on message send failure', (done) => {
    shouldFail = true;
    const event = { ...baseEvent };
    const callback = (err, result) => {
      expect(err).toBeFalsy();
      const twiml = result.toString();
      expect(twiml).toMatch(
        `<Message>${ERROR_MESSAGE}</Message>`
      );

      done();
    };

    relaySms(context, event, callback);
  });
});
