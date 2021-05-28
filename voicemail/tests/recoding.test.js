let mockedTimeString = 'Thu, 13 Feb 2020 10:00:00 +0000';
jest.mock('moment', () => {
  const actualMoment = jest.requireActual('moment');
  return () => {
    return actualMoment(mockedTimeString);
  };
});

const helpers = require('../../test/test-helper');
const recordingFunction = require('../functions/recording').handler;
const Twilio = require('twilio');

const mockCall = {
  callSid: 'CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  from: '+9998887777',
  to: '+1234567890',
};

let shouldFail = false;
const mockClient = {
  calls: () => {
    return {
      fetch: jest.fn(() => mockCall),
    };
  },
  messages: {
    create: jest.fn(() => {
      if (shouldFail) {
        throw new Error('failed to send mock sms');
      } else {
        return {
          sid: 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        };
      }
    }),
  },
};

let context = {
  getTwilioClient: () => mockClient,
  MY_PHONE_NUMBER: '+12223334444',
};
let event = {
  RecordingUrl: 'http://localhost/demo',
};

beforeAll(() => {
  helpers.setup(context);
});

afterEach(() => {
  event = {};
});

afterAll(() => {
  helpers.teardown();
});

test('sends an sms', (done) => {
  const callback = (err, result) => {
    expect(err).toBe(null);
    expect(mockClient.messages.create.mock.calls.length).toBe(1);
    expect(mockClient.messages.create.mock.calls[0]).toEqual([
      {
        from: '+1234567890',
        to: '+12223334444',
        body: 'You have a new message to your Twilio voicemail from +9998887777.\nhttp://localhost/demo',
      },
    ]);
    expect(result).toBeUndefined();
    done();
  };

  recordingFunction(context, event, callback);
});

test('handles error', (done) => {
  shouldFail = true;
  const callback = (err, result) => {
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('failed to send mock sms');
    expect(result).toBeUndefined();
    done();
  };

  recordingFunction(context, event, callback);
});
