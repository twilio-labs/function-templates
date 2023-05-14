const helpers = require('../../test/test-helper');
const sgMail = require('@sendgrid/mail');
const sendGrid =
  require('../functions/forward-message-sendgrid.protected').handler;
const Twilio = require('twilio');

const context = {
  SENDGRID_API_KEY: 'APIKEY',
  TO_EMAIL_ADDRESS: 'test_to@example.com',
  FROM_EMAIL_ADDRESS: 'test_from@example.com',
};
const event = {
  Body: 'Hello',
  From: 'ExternalNumber',
};

// Mock the send function of sgMail
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('returns an TwiML MessagingResponse', (done) => {
  // Mock the sgMail send method to resolve successfully
  sgMail.send.mockResolvedValue({});

  const callback = (_err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
    done();
  };

  sendGrid(context, event, callback);
});

test('returns an error when the external request fails', (done) => {
  // Mock the sgMail send method to reject with an error
  sgMail.send.mockRejectedValue(new Error('send failed'));

  const callback = (error, _result) => {
    expect(error).toBeInstanceOf(Error);
    done();
  };

  sendGrid(context, event, callback);
});
