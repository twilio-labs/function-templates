const helpers = require('../../test/test-helper');
const forwardSms = require('../functions/forward-sms.protected').handler;
const Twilio = require('twilio');

const context = {};
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

  forwardSms(context, event, callback);
});

test('forwards the message to a static number', (done) => {
  const callback = (_err, result) => {
    expect(result.toString()).toMatch('to="+15095550100"');
    done();
  };

  forwardSms(context, event, callback);
});

test('includes the original From number and Body', (done) => {
  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      `>From: ${event.From}. Body: ${event.Body}<`
    );
    done();
  };

  forwardSms(context, event, callback);
});
