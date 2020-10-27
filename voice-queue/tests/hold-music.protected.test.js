const helpers = require('../../test/test-helper');
const holdMusic = require('../functions/hold-music.protected').handler;

const context = {
  HOLD_MUSIC_URL: 'https://demo.twilio.com/docs/classic.mp3'
};

const event = {};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('plays hold music', done => {
  const callback = (err, result) => {
    expect(result.toString()).toMatch('<Play>' + context.HOLD_MUSIC_URL + '</Play>');
    done();
  };

  holdMusic(context, event, callback);
});