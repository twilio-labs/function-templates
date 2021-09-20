const helpers = require('../../test/test-helper');
const { handler } = require('../functions/notify');

const mockClient = {
  messages: {
    create: jest.fn(async () => {
      return {
        sid: 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      };
    }),
  },
};

const context = {
  getTwilioClient: () => mockClient,
  TWILIO_PHONE_NUMBER: '+17778889999',
};
const event = {};

let returnPhoneNumbers = [];
const mockGetAllPhoneNumbers = jest.fn(async () => {
  return returnPhoneNumbers;
});
jest.mock('../assets/data.private.js', () => {
  return {
    getAllPhoneNumbers: mockGetAllPhoneNumbers,
  };
});

const mockIsAuthenticated = jest.fn(() => true);
jest.mock('../assets/auth.private.js', () => {
  return {
    isAuthenticated: mockIsAuthenticated,
  };
});

let env;
beforeAll(() => {
  env = helpers.backupEnv();
  process.env = context;
  const runtime = new helpers.MockRuntime();
  runtime._addAsset('/data.js', '../assets/data.private.js');
  runtime._addAsset('/auth.js', '../assets/auth.private.js');
  helpers.setup(context, runtime);
});
afterAll(() => {
  helpers.teardown();
  helpers.restoreEnv(env);
});

beforeEach(() => {
  mockClient.messages.create.mockClear();
});

test('handles empty list', (done) => {
  returnPhoneNumbers = [];
  const callback = (err, result) => {
    expect(err).toEqual(null);
    expect(result).toEqual({
      result: [],
    });
    done();
  };
  handler(context, event, callback);
});

test('handles non-empty list', (done) => {
  returnPhoneNumbers = ['+12223334444'];
  const callback = (err, result) => {
    expect(err).toEqual(null);
    expect(mockClient.messages.create).toHaveBeenCalledWith({
      from: '+17778889999',
      to: '+12223334444',
      body: 'Hey this is the notification you asked for.',
    });
    expect(result).toEqual({
      result: ['MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'],
    });
    done();
  };
  handler(context, event, callback);
});

test('handles if phone numbers is not a list', (done) => {
  returnPhoneNumbers = 'invalid';
  const callback = (err, result) => {
    expect(mockClient.messages.create).toHaveBeenCalledTimes(0);
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toEqual('Server error. Please check logs.');
    expect(result).toEqual(undefined);
    done();
  };
  handler(context, event, callback);
});

test('handles some message failures', (done) => {
  returnPhoneNumbers = ['+12223334444', '+13334445555', '+14445556666'];
  mockClient.messages.create.mockReturnValueOnce(
    Promise.resolve({ sid: 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxy' })
  );
  mockClient.messages.create.mockReturnValueOnce(
    Promise.reject(new Error('MOCK ERROR'))
  );
  const callback = (err, result) => {
    expect(err).toEqual(null);
    expect(mockClient.messages.create).toHaveBeenCalledTimes(3);
    expect(result).toEqual({
      result: [
        'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxy',
        null,
        'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      ],
    });
    done();
  };
  handler(context, event, callback);
});

test('handles unauthenticated requests', (done) => {
  mockIsAuthenticated.mockReturnValueOnce(false);

  const callback = (err, result) => {
    expect(err).toEqual(null);
    expect(result).toBeInstanceOf(Twilio.Response);
    expect(result._statusCode).toEqual(401);
    expect(result._body).toEqual({
      error: 'INVALID',
    });
    done();
  };
  handler(context, event, callback);
});

test('handles unexpected errors', (done) => {
  mockGetAllPhoneNumbers.mockImplementationOnce(async () => {
    throw new Error('MOCK ERROR');
  });

  const callback = (err, result) => {
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toEqual('Server error. Please check logs.');
    expect(result).toEqual(undefined);
    done();
  };
  handler(context, event, callback);
});
