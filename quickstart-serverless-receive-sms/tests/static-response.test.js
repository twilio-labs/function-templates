const helpers = require('../../test/test-helper');
const staticResponse =
  require('../functions/static-response.protected').handler;
const Twilio = require('twilio');

const context = {};
const event = {};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('returns a MessagingResponse', (done) => {
  const callback = (_err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
    done();
  };

  staticResponse(context, event, callback);
});

test('says Hello, World!', (done) => {
  const callback = (_err, result) => {
    expect(result.toString()).toMatch('<Message>Hello, World!</Message>');
    done();
  };

  staticResponse(context, event, callback);
});
