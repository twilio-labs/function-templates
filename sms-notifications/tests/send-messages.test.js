const helpers = require('../../test/test-helper');
const sendMessages = require('../functions/send-messages').handler;

let failOnCount = undefined;
let invocationCount = 0;
const mockTwilioClient = {
  messages: {
    create: jest.fn(() => {
      let response = Promise.resolve({
        sid: 'my-new-sid',
      });
      if (invocationCount === failOnCount) {
        response = Promise.reject(new Error('Expected test error'));
      }
      invocationCount++;
      return response;
    }),
  },
};

const context = {
  PASSCODE: '123456',
  TWILIO_PHONE_NUMBER: '+12223334444',
  getTwilioClient: () => mockTwilioClient,
};

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

test('returns 401 if the request was invalid', (done) => {
  const callback = (err, result) => {
    expect(mockTwilioClient.messages.create).not.toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result._statusCode).toEqual(401);
    done();
  };

  const event = {
    passcode: '111111',
    message: 'Hello from the tests',
    recipients: '+13334445555,+12345678901',
  };

  sendMessages(context, event, callback);
});

test('sends one successful message', (done) => {
  const callback = (err, result) => {
    expect(err).toEqual(null);
    expect(mockTwilioClient.messages.create).toHaveBeenCalledTimes(1);
    expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
      from: '+12223334444',
      to: '+13334445555',
      body: 'Hello from the tests',
    });
    expect(result).toEqual({
      result: [{ success: true, sid: 'my-new-sid' }],
    });
    done();
  };

  const event = {
    passcode: '123456',
    message: 'Hello from the tests',
    recipients: '+13334445555',
  };

  sendMessages(context, event, callback);
});

test('sends multiple successful messages', (done) => {
  const callback = (err, result) => {
    expect(err).toEqual(null);
    expect(mockTwilioClient.messages.create).toHaveBeenCalledTimes(3);
    expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
      from: '+12223334444',
      to: '+13334445555',
      body: 'Hello from the tests',
    });
    expect(result).toEqual({
      result: [
        { success: true, sid: 'my-new-sid' },
        { success: true, sid: 'my-new-sid' },
        { success: true, sid: 'my-new-sid' },
      ],
    });
    done();
  };

  const event = {
    passcode: '123456',
    message: 'Hello from the tests',
    recipients: '+13334445555,+7778889999,+12345678901',
  };

  sendMessages(context, event, callback);
});

test('handles message requests failing', (done) => {
  failOnCount = 1;
  const callback = (err, result) => {
    expect(err).toEqual(null);
    expect(mockTwilioClient.messages.create).toHaveBeenCalledTimes(3);
    expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
      from: '+12223334444',
      to: '+13334445555',
      body: 'Hello from the tests',
    });
    expect(result).toEqual({
      result: [
        { success: true, sid: 'my-new-sid' },
        { success: false, error: 'Expected test error' },
        { success: true, sid: 'my-new-sid' },
      ],
    });
    done();
  };

  const event = {
    passcode: '123456',
    message: 'Hello from the tests',
    recipients: '+13334445555,+7778889999,+12345678901',
  };

  sendMessages(context, event, callback);
});
