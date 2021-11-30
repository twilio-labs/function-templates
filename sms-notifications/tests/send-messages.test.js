const helpers = require('../../test/test-helper');
const sendMessages = require('../functions/send-messages').handler;

let failOnCount = undefined;
let invocationCount = 0;
const mockTwilioClient = {
  messages: {
    create: jest.fn((request) => {
      let response = Promise.resolve({
        sid: 'my-new-sid',
        to: request.to, 
        body: request.body,
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
  PASSCODE: '123456',
  TWILIO_PHONE_NUMBER: '+12223334444',
  TESTMODE: 'false',
  TEST_ACCOUNT_SID: 'ACxxxxxxxxxxxxxxxxxxxxx',
  TEST_AUTH_TOKEN: 'xxxxxxxxxxxxxxxxxxxxxx',
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
  const callback = (_err, result) => {
    expect(mockTwilioClient.messages.create).not.toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result._statusCode).toEqual(401);
    done();
  };

  const event = {
    passcode: '111111',
    message: 'Hello from the tests',
    recipients: [
      { number: '+13334445555', parameters: ['test', '1'] },
      { number: '+12345678901', parameters: ['test', '2'] },
    ],
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
      body: 'Hello from the tests test 3',
    });
    expect(result).toEqual({
      result: [{ success: true, sid: 'my-new-sid', body: 'Hello from the tests test 3', to: '+13334445555'}],
      requestId: undefined
    });
    done();
  };

  const event = {
    passcode: '123456',
    message: 'Hello from the tests {1} {2}',
    recipients: [{number: '+13334445555', parameters: ['+13334445555', 'test', '3']}],
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
        { success: true, sid: 'my-new-sid', body: 'Hello from the tests', to: '+13334445555'  },
        { success: true, sid: 'my-new-sid', body: 'Hello from the tests', to: '+7778889999'  },
        { success: true, sid: 'my-new-sid', body: 'Hello from the tests', to: '+12345678901'  },
      ],
      requestId: undefined
    });
    done();
  };

  const event = {
    passcode: '123456',
    message: 'Hello from the tests',
    recipients: [
      {number: '+13334445555', parameters: ['test', '1']},
      {number: '+7778889999', parameters: ['test', '2']},
      {number: '+12345678901', parameters: ['test', '3']},
    ],
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
        { success: true, sid: 'my-new-sid', body: 'Hello from the tests', to: '+13334445555' },
        { success: false, error: 'Expected test error', to: 'unknown' },
        { success: true, sid: 'my-new-sid', body: 'Hello from the tests', to: '+12345678901' },
      ], 
      requestId: undefined
    });
    done();
  };

  const event = {
    passcode: '123456',
    message: 'Hello from the tests',
    recipients:  [
      {number: '+13334445555', parameters: ['test', '1']},
      {number: '+7778889999', parameters: ['test', '2']},
      {number: '+12345678901', parameters: ['test', '3']},
    ],
  };

  sendMessages(context, event, callback);
});
