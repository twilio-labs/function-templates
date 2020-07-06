const helpers = require('../../test/test-helper');
const conferenceHandler = require('../functions/conference-with-pin.protected')
  .handler;
const Twilio = require('twilio');

const context = {
  CONFERENCE_PIN: '112233',
};
const event = {};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('returns an error if no conference PIN is set', (done) => {
  const callback = (err, result) => {
    expect(err).toEqual(
      new Error('This function needs a conference pin to work')
    );
    expect(result).toBeUndefined();
    done();
  };

  conferenceHandler({}, event, callback);
});

test('returns a VoiceResponse', (done) => {
  const callback = (err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
    done();
  };

  conferenceHandler(context, event, callback);
});

test('prompts for PIN by default', (done) => {
  const callback = (err, result) => {
    expect(result.toString()).toContain(
      '<Response><Gather><Say>Welcome! Please enter the PIN for this conference line followed by a hash.</Say></Gather></Response>'
    );
    done();
  };

  conferenceHandler(context, event, callback);
});

test('connects to conference with a valid PIN', (done) => {
  const callback = (err, result) => {
    expect(result.toString()).toContain(
      '<Response><Say>Thank you! You are joining the conference</Say><Dial><Conference>My pin protected conference</Conference></Dial></Response>'
    );
    done();
  };

  conferenceHandler(context, { Digits: '112233' }, callback);
});

test('rejects caller with an invalid PIN', (done) => {
  const callback = (err, result) => {
    expect(result.toString()).toContain(
      `<Response><Say>I'm sorry but the code is invalid. Please try again. Thank you</Say><Hangup/></Response>`
    );
    done();
  };

  conferenceHandler(context, { Digits: '111111' }, callback);
});
