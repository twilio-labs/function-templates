const helpers = require('../test/test-helper');
const forwardMessageMultiple = require('./forward-message-multiple').handler;
const Twilio = require('twilio');

const context = {
  FORWARDING_NUMBERS: 'TwilioNumber1, TwilioNumber2'
};
const event = {
  Body: 'Hello',
  From: 'ExternalNumber'
};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('returns a MessagingResponse', done => {
  const callback = (err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
    done();
  };

  forwardMessageMultiple(context, event, callback);
});

test('forwards the message to both numbers from the context', done => {
  const callback = (err, result) => {
    const twiml = result.toString();
    expect(twiml).toMatch('to="TwilioNumber1"');
    expect(twiml).toMatch('to="TwilioNumber2"');
    expect(twiml.match(/<Message/g).length).toEqual(2);
    done();
  };

  forwardMessageMultiple(context, event, callback);
});

test('includes the original From number and Body', done => {
  const callback = (err, result) => {
    expect(result.toString()).toMatch(
      '>From: ' + event.From + '. Body: ' + event.Body + '<'
    );
    done();
  };

  forwardMessageMultiple(context, event, callback);
});
