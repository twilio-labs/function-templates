const helpers = require('../../test/test-helper');
const forwardSmsEnv =
  require('../functions/forward-sms-env-vars.protected').handler;
const Twilio = require('twilio');

const context = {
  MY_PHONE_NUMBER: '+555555555',
};
const event = {
  Body: 'Ahoy!',
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

  forwardSmsEnv(context, event, callback);
});

test('forwards the message to the number in context', (done) => {
  const callback = (_err, result) => {
    expect(result.toString()).toMatch(`to="${context.MY_PHONE_NUMBER}"`);
    done();
  };

  forwardSmsEnv(context, event, callback);
});

test('includes the original From number and Body', (done) => {
  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      `>From: ${event.From}. Body: ${event.Body}<`
    );
    done();
  };

  forwardSmsEnv(context, event, callback);
});
