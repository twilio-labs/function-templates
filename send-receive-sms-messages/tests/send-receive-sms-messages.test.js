const helpers = require('../../test/test-helper');
const sendReceiveSmsMessages =
  require('../functions/send-receive-sms-messages.protected').handler;
const Twilio = require('twilio');

const context = {};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('returns a MessagingResponse', (done) => {
  const event = {
    Body: 'never gonna',
  };
  const callback = (_err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
    done();
  };

  sendReceiveSmsMessages(context, event, callback);
});

test('includes an expected response when body is "never gonna"', (done) => {
  const event = {
    Body: 'never gonna',
  };

  const options = [
    'give you up',
    'let you down',
    'make you cry',
    'run around and desert you',
    'say goodbye',
    'tell a lie, and hurt you',
  ];

  const callback = (_err, result) => {
    const twiml = result.toString();
    const re = new RegExp(options.join('|'));
    expect(twiml.match(re));
    done();
  };

  sendReceiveSmsMessages(context, event, callback);
});

test('includes the default response when body is not "never gonna"', (done) => {
  const event = {
    Body: '',
  };
  const default_response =
    "I just wanna tell you how I'm feeling - Gotta make you understand";

  const callback = (_err, result) => {
    const twiml = result.toString();
    const re = new RegExp(default_response);
    expect(twiml.match(re));
    done();
  };

  sendReceiveSmsMessages(context, event, callback);
});
