const helpers = require('../test/test-helper');
const got = jest.mock('got');
const sparkPost = require('./sparkpost').handler;
const Twilio = require('twilio');

const context = {
  SPARKPOST_API_KEY: 'APIKEY',
  TO_EMAIL_ADDRESS: 'test_to@example.com',
  FROM_EMAIL_ADDRESS: 'test_from@example.com'
};
const event = {
  Body: 'Hello',
  From: 'ExternalNumber'
};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('returns an TwiML MessagingResponse', done => {
  const callback = (err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
    done();
  };

  sparkPost(context, event, callback);
});

test('returns an error when the external request fails', done => {
  const callback = (err, result) => {
    expect(err).toBeInstanceOf(Error);
    done();
  };

  got.shouldSucceed = false;

  sparkPost(context, event, callback);
});
