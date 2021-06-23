const helpers = require('../../test/test-helper');
const forwardMessage = require('../functions/forward-message').handler;
const Twilio = require('twilio');

const context = {
  MY_PHONE_NUMBER: 'TwilioNumber',
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

test('returns a MessagingResponse', (done) => {
  const callback = (_err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
    done();
  };

  forwardMessage(context, event, callback);
});

test('forwards the message to the number from the context', (done) => {
  const callback = (_err, result) => {
    expect(result.toString()).toMatch(`to="${context.MY_PHONE_NUMBER}"`);
    done();
  };

  forwardMessage(context, event, callback);
});

test('includes the original From number and Body', (done) => {
  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      `>From: ${event.From}. Body: ${event.Body}<`
    );
    done();
  };

  forwardMessage(context, event, callback);
});
