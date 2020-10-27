const helpers = require('../../test/test-helper');
const dialQueue = require('../functions/dial-queue.protected').handler;

const context = {};

const event = {
  fromCallSid: 'CAX',
  from: '123'
};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('returns a VoiceResponse with a Whisper and Queue with CallSid id', done => {
  const callback = (err, result) => {
  expect(result.toString()).toMatch(
    '<Say>You have an incoming call from ' + event.from.split('').join(' ') + '</Say>' +
    '<Dial><Queue>' + event.fromCallSid + '</Queue></Dial>')
  done();
};

  dialQueue(context, event, callback);
});