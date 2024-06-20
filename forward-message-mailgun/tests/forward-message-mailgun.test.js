const helpers = require('../../test/test-helper');
const forwardMessageToMailgun =
  require('../functions/forward-message-mailgun.protected').handler;
const Twilio = require('twilio');

jest.mock('mailgun.js', () => {
  class Mailgun {
    client() {
      return {
        messages: {
          create: jest.fn(async () => 'success'),
        },
      };
    }
  }
  return Mailgun;
});

const context = {
  MAILGUN_API_KEY: 'MAILGUN_API_KEY',
  DOMAIN: 'DOMAIN',
  TO_EMAIL_ADDRESS: 'TO_EMAIL_ADDRESS',
  FROM_EMAIL_ADDRESS: 'FROM_EMAIL_ADDRESS',
};

const event = {
  Body: 'Hello',
  From: 'ExternalNumber',
};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('returns an TwiML MessagingResponse', async () => {
  const callback = (err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
    expect(err).toBeFalsy();
  };

  forwardMessageToMailgun(context, event, callback);
});
