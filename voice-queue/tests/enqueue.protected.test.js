const helpers = require('../../test/test-helper');
const enqueue = require('../functions/enqueue.protected').handler;

const context = {};

const event = {
  CallSid: 'CAX',
};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('returns a VoiceResponse with an Enqueue id', done => {
  const callback = (err, result) => {
    expect(result.toString()).toMatch('<Enqueue waitUrl="/hold-music">' + event.CallSid + '</Enqueue>');
    done();
  };

  enqueue(context, event, callback);
});