const helpers = require('../../test/test-helper');
const forwardCall = require('../functions/forward-call.protected').handler;
const Twilio = require('twilio');

const context = {
  MY_PHONE_NUMBER: 'TwilioNumber',
};
const event = {};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('returns a VoiceResponse', (done) => {
  const callback = (_err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
    done();
  };

  forwardCall(context, event, callback);
});

test('forwards the call to the number from the context', (done) => {
  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      `<Dial>${context.MY_PHONE_NUMBER}</Dial>`
    );
    done();
  };

  forwardCall(context, event, callback);
});
