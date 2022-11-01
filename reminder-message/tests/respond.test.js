const helpers = require('../../test/test-helper');
const { handler } = require('../functions/respond.protected');
const Twilio = require('twilio');

const mockTwilioClient = {
  messages: {
    create: jest.fn(() => {
      return Promise.resolve({
        sid: 'my-new-sid',
      });
    }),
  },
};

const context = {
  getTwilioClient: () => mockTwilioClient,
};
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

  handler(context, event, callback);
});

test('sends default message', (done) => {
  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      '<Message>Hello there! Please send "Y" to confirm your appointment and we will send you a reminder.</Message>'
    );
    done();
  };

  handler(context, event, callback);
});

test('sends scheduled message confirmation with 5 minutes default', (done) => {
  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      '<Message>Thank you! We will send you a reminder in 15 minutes</Message>'
    );
    done();
  };

  handler(context, { ...event, Body: 'Y' }, callback);
});

test('sends confirmation with configured delay', (done) => {
  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      '<Message>Thank you! We will send you a reminder in 30 minutes</Message>'
    );
    done();
  };

  handler(
    { ...context, DELAY_IN_MINUTES: '30' },
    { ...event, Body: 'Y' },
    callback
  );
});

test('handles lower case y as confirmation', (done) => {
  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      '<Message>Thank you! We will send you a reminder in 15 minutes</Message>'
    );
    done();
  };

  handler(context, { ...event, Body: 'y' }, callback);
});
