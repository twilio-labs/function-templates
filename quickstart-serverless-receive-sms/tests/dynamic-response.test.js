const helpers = require('../../test/test-helper');
const dynamicResponse =
  require('../functions/dynamic-response.protected').handler;
const Twilio = require('twilio');

const context = {};

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
  const event = {
    Body: '',
  };

  dynamicResponse(context, event, callback);
});

describe('dynamic responses', () => {
  test('hello', (done) => {
    const callback = (_err, result) => {
      expect(result.toString()).toMatch('<Message>Hello, there!</Message>');
      done();
    };
    const event = {
      Body: 'oh hello there',
    };

    dynamicResponse(context, event, callback);
  });

  test('bye', (done) => {
    const callback = (_err, result) => {
      expect(result.toString()).toMatch('<Message>Goodbye!</Message>');
      done();
    };
    const event = {
      Body: 'I guess it is goodbye, then',
    };

    dynamicResponse(context, event, callback);
  });

  test('no match', (done) => {
    const callback = (_err, result) => {
      expect(result.toString()).toMatch(
        '<Message>Not sure what you meant! Please say hello or bye!</Message>'
      );
      done();
    };
    const event = {
      Body: 'what is a twololio?',
    };

    dynamicResponse(context, event, callback);
  });
});
