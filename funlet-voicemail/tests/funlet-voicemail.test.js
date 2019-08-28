const funlet = require('../functions/funlet-voicemail');
const runtime = require('../../test/test-helper');
const Twilio = require('twilio');

beforeAll( () =>
  runtime.setup()
);

test.skip('Missing Tests', done => {
  const callback = (err, result) => {
    expect(result).toBe('...');
    done();
  };
  funlet.handler({}, {}, callback);
});

afterAll( () =>
  runtime.teardown()
);
