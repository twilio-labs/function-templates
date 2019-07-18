const neverGonnaGiveYouUp = require('./never-gonna-give-you-up').handler;
const helpers = require('../test/test-helper');

describe('', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns the right song', done => {
    const callback = (err, result) => {
      expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
      expect(result.toString()).toMatch(
        '<Response><Play>https://demo.twilio.com/docs/classic.mp3</Play></Response>'
      );
      done();
    };
    neverGonnaGiveYouUp({}, {}, callback);
  });
});
