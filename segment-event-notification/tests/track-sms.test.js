const helpers = require('../../test/test-helper');
const trackSms = require('../functions/track-sms').handler;

const messagesCreate = jest.fn();

const MY_PHONE_NUMBER = '+12223334444';
const TWILIO_PHONE_NUMBER = '+56667778888';
const SEGMENT_EVENT = 'test event';

const context = {
  MY_PHONE_NUMBER,
  TWILIO_PHONE_NUMBER,
  SEGMENT_EVENT,
  getTwilioClient: jest.fn(() => ({
    messages: {
      create: messagesCreate,
    }
  })),
};

const baseEvent = {
  type: 'track',
  event: SEGMENT_EVENT,
};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

afterEach(() => {
  messagesCreate.mockClear();
});

it('should send an SMS after a matching event is received', (done) => {
  const event = {
    ...baseEvent,
  };
  const callback = (err, _result) => {
    expect(err).toBeFalsy();
    expect(messagesCreate).toHaveBeenCalledWith({
      to: MY_PHONE_NUMBER,
      from: TWILIO_PHONE_NUMBER,
      body: `The Segment event "${SEGMENT_EVENT}" occurred.`
    });
    done();
  };

  trackSms(context, event, callback);
});

it('should send an SMS after a matching event is received with properties', (done) => {
  const event = {
    ...baseEvent,
    properties: {
      test: true,
      n: 1,
      s: 'hello',
    },
  };
  const callback = (err, _result) => {
    expect(err).toBeFalsy();
    expect(messagesCreate).toHaveBeenCalledWith({
      to: MY_PHONE_NUMBER,
      from: TWILIO_PHONE_NUMBER,
      body: `The Segment event "${SEGMENT_EVENT}" occurred.

test: true
n: 1
s: hello
`
    });
    done();
  };

  trackSms(context, event, callback);
});

it('should filter out non-track type events', (done) => {
  const event = {
    ...baseEvent,
    type: 'group',
  };
  const callback = (err, _result) => {
    expect(err).toBeFalsy();
    expect(messagesCreate).not.toHaveBeenCalled();
    done();
  };

  trackSms(context, event, callback);
});

it('should filter out irrelevant events', (done) => {
  const event = {
    ...baseEvent,
    event: 'irrelevant test event',
  };
  const callback = (err, _result) => {
    expect(err).toBeFalsy();
    expect(messagesCreate).not.toHaveBeenCalled();
    done();
  };

  trackSms(context, event, callback);
});
