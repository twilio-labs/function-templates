const helpers = require('../../test/test-helper');
const forwardMessage =
  require('../functions/forward-message.protected').handler;
const Twilio = require('twilio');

const context = {
  FORWARDING_NUMBERS: 'TwilioNumber1, TwilioNumber2',
};

const event = {
  Body: 'Hello',
  From: 'ExternalNumber',
};

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

  forwardMessage(context, event, callback);
});

test('forwards the message to a single number from the context', (done) => {
  const singleNumberContext = {
    ...context,
    FORWARDING_NUMBERS: 'TwilioNumber1',
  };

  const callback = (_err, result) => {
    const twiml = result.toString();
    expect(twiml.match(/<Message/g).length).toEqual(1);
    done();
  };

  forwardMessage(singleNumberContext, event, callback);
});

test('forwards the message to both numbers from the context', (done) => {
  const callback = (_err, result) => {
    const twiml = result.toString();
    expect(twiml).toMatch('to="TwilioNumber1"');
    expect(twiml).toMatch('to="TwilioNumber2"');
    expect(twiml.match(/<Message/g).length).toEqual(2);
    done();
  };

  forwardMessage(context, event, callback);
});

test('does not forward the message if no phone number is provided', (done) => {
  const noNumberContext = {
    ...context,
    FORWARDING_NUMBERS: '',
  };

  const callback = (_err, result) => {
    const twiml = result.toString();

    expect(twiml).toMatch('to=""');
    done();
  };

  forwardMessage(noNumberContext, event, callback);
});

test('includes the original From number and Body', (done) => {
  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      `>From: ${event.From}. Body: ${event.Body}`
    );
    done();
  };

  forwardMessage(context, event, callback);
});
