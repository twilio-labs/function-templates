const helpers = require('../../test/test-helper');
const sendEvent = require('../functions/send-event').handler;

const MY_PHONE_NUMBER = '+12223334444';
const TWILIO_PHONE_NUMBER = '+56667778888';
const SENDGRID_MOCK_EMAIL = 'twilio@sendgrid.com';
const SENDGRID_MOCK_CATERGORY = ['promotion'];
let invocationCount = 0;
let failOnCount = undefined;
const mockTwilioClient = {
  messages: {
    create: jest.fn(() => {
      let response = Promise.resolve({
        sid: 'my-new-sid',
      });
      if (invocationCount === failOnCount) {
        response = Promise.reject(new Error('Expected test error'));
      }
      invocationCount += 1;
      return response;
    }),
  },
};

const context = {
  MY_PHONE_NUMBER,
  TWILIO_PHONE_NUMBER,
  getTwilioClient: () => mockTwilioClient,
};

const openEvent = [
  {
    event: 'open',
    email: SENDGRID_MOCK_EMAIL,
  },
];
const deliveredEvent = [
  {
    event: 'delivered',
    email: SENDGRID_MOCK_EMAIL,
  },
];
const clickEventWithCategory = [
  {
    event: 'click',
    category: SENDGRID_MOCK_CATERGORY,
    email: SENDGRID_MOCK_EMAIL,
  },
];

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

beforeEach(() => {
  invocationCount = 0;
  failOnCount = undefined;
  mockTwilioClient.messages.create.mockClear();
});

it('should send an SMS after an event is received', (done) => {
  const event = openEvent;
  const callback = (err, _result) => {
    expect(err).toBeFalsy();
    expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
      to: MY_PHONE_NUMBER,
      from: TWILIO_PHONE_NUMBER,
      body: `Your email has been opened by ${SENDGRID_MOCK_EMAIL}.`,
    });
    done();
  };

  sendEvent(context, event, callback);
});

it('should send an SMS after an event is received with category', (done) => {
  const event = clickEventWithCategory;
  const callback = (err, _result) => {
    expect(err).toBeFalsy();
    expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
      to: MY_PHONE_NUMBER,
      from: TWILIO_PHONE_NUMBER,
      body: `The link in your '${SENDGRID_MOCK_CATERGORY}' email has been clicked by ${SENDGRID_MOCK_EMAIL}.`,
    });
    done();
  };

  sendEvent(context, event, callback);
});

it('should filter out non-track type events', (done) => {
  const event = deliveredEvent;
  const callback = (err, _result) => {
    expect(err).toBeFalsy();
    expect(mockTwilioClient.messages.create).not.toHaveBeenCalled();
    done();
  };

  sendEvent(context, event, callback);
});

it('should process multiple events in one payload', (done) => {
  const event = [
    { event: 'open', email: SENDGRID_MOCK_EMAIL },
    {
      event: 'click',
      email: SENDGRID_MOCK_EMAIL,
      category: SENDGRID_MOCK_CATERGORY,
    },
  ];
  const callback = (err, result) => {
    expect(err).toBeFalsy();
    expect(mockTwilioClient.messages.create).toHaveBeenCalledTimes(2);
    expect(result.result).toHaveLength(2);
    expect(result.result[0].success).toBe(true);
    expect(result.result[1].success).toBe(true);
    done();
  };
  sendEvent(context, event, callback);
});

it('should handle errors from Twilio client', (done) => {
  failOnCount = 0; // First call will fail
  const event = openEvent;
  const callback = (err, result) => {
    expect(err).toBeFalsy();
    expect(result.result[0].success).toBe(false);
    expect(result.result[0].error).toBe('Expected test error');
    done();
  };
  sendEvent(context, event, callback);
});

it('should handle click event without category', (done) => {
  const event = [{ event: 'click', email: SENDGRID_MOCK_EMAIL }];
  const callback = (err, _result) => {
    expect(err).toBeFalsy();
    expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
      to: MY_PHONE_NUMBER,
      from: TWILIO_PHONE_NUMBER,
      body: `The link in your email has been clicked by ${SENDGRID_MOCK_EMAIL}.`,
    });
    done();
  };
  sendEvent(context, event, callback);
});
