const helpers = require('../../test/test-helper');
const voiceIvr = require('../functions/voice-ivr.protected').handler;
const Twilio = require('twilio');

const context = {};
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

  voiceIvr(context, event, callback);
});

test('prompts for the right options', (done) => {
  const callback = (_err, result) => {
    const twiml = result.toString();
    expect(twiml).toMatch(
      '<Gather numDigits="1" action="handle-user-input" hints="sales, opening hours, address" input="speech dtmf">'
    );
    expect(twiml).toMatch(
      '<Say>Please press 1 or say Sales to talk to someone</Say>'
    );
    expect(twiml).toMatch(
      '<Say>Press 2 or say Opening Hours to hear when we are open</Say>'
    );
    expect(twiml).toMatch(
      '<Say>Press 3 or say Address to receive a text message with our address</Say>'
    );
    expect(twiml).toMatch(`<Say>Sorry we couldn't understand you</Say>`);
    done();
  };

  voiceIvr(context, event, callback);
});
