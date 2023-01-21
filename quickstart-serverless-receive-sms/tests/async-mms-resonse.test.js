const helpers = require('../../test/test-helper');
const asyncMmsResponse =
  require('../functions/async-mms-response.protected').handler;
const Twilio = require('twilio');
const axios = require('axios');

jest.mock('axios');

axios.get.mockResolvedValue({ data: { message: 'www.doggo.com' } });

const context = {};
const event = {
  From: 'IncomingNumber',
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

  asyncMmsResponse(context, event, callback);
});

test('replies with a message and includes media', (done) => {
  const callback = (_err, result) => {
    expect(result.toString()).toMatch(`Hello, ${event.From}! Enjoy this doge!`);
    expect(result.toString()).toMatch(`<Media>www.doggo.com</Media>`);
    done();
  };

  asyncMmsResponse(context, event, callback);
});

test('handles and logs network errors', (done) => {
  const error = new Error('doggos down');
  axios.get = jest.fn().mockRejectedValue(error);
  console.error = jest.fn();

  const callback = (err, result) => {
    expect(err).toBeDefined();
    expect(result).toBeUndefined();
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(error);
    done();
  };

  asyncMmsResponse(context, event, callback);
});
