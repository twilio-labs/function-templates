const helpers = require('../../test/test-helper');
const helloVoice = require('../functions/hello-messaging.protected').handler;
const Twilio = require('twilio');

const context = {};
const event = {};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('returns a VoiceResponse', done => {
  const callback = (err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
    done();
  };

  helloVoice(context, event, callback);
});

test('says Hello World', done => {
  const callback = (err, result) => {
    expect(result.toString()).toMatch('<Message>Hello World</Message>');
    done();
  };

  helloVoice(context, event, callback);
});
