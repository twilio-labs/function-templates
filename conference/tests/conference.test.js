const conference = require('../functions/conference').handler;
const helpers = require('../../test/test-helper');

describe('simple conference', () => {
  const context = {};
  const event = {};
  beforeAll(() => {
    helpers.setup(context);
  });

  afterAll(() => {
    helpers.teardown();
  });

  it('returns a VoiceResponse', (done) => {
    const callback = (err, result) => {
      expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
      done();
    };

    conference(context, event, callback);
  });

  it('connects a call to a conference called Snowy Owl', (done) => {
    const callback = (err, result) => {
      expect(result.toString()).toMatch(
        '<Dial><Conference>Snowy Owl</Conference></Dial>'
      );
      done();
    };

    conference(context, event, callback);
  });
});
