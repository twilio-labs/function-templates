const helpers = require('../../test/test-helper');
const gatedConferenceHandler =
  require('../functions/gated-conference.protected').handler;
const Twilio = require('twilio');

const context = {
  MODERATOR_PHONE_NUMBER: '+12345678901',
  VALID_PARTICIPANTS: '+14445556666,+13334445555',
};
const event = {
  From: '+12223334444',
};

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

  gatedConferenceHandler(context, event, callback);
});

test('rejects unknown numbers', (done) => {
  const callback = (_err, result) => {
    expect(result.toString()).toContain(
      `<Response><Say>I'm sorry but I don't recognize your number. Have a good day.</Say><Hangup/></Response>`
    );
    done();
  };

  gatedConferenceHandler(context, event, callback);
});

test('grants moderator access', (done) => {
  const callback = (_err, result) => {
    expect(result.toString()).toContain(
      `<Response><Say>Thank you! You are joining the conference</Say><Dial><Conference startConferenceOnEnter="true" endConferenceOnExit="true">My gated conference</Conference></Dial></Response>`
    );
    done();
  };

  gatedConferenceHandler(context, { From: '+12345678901' }, callback);
});

test('grants valid callers access', (done) => {
  const callback = (_err, result) => {
    expect(result.toString()).toContain(
      `<Response><Say>Thank you! You are joining the conference</Say><Dial><Conference startConferenceOnEnter="false" endConferenceOnExit="false">My gated conference</Conference></Dial></Response>`
    );
    done();
  };

  gatedConferenceHandler(context, { From: '+13334445555' }, callback);
});
