const helpers = require('../../test/test-helper');
const { handler } = require('../functions/delete-subscriptions');

const context = {};
const event = {};

let deleteSuccess = true;
const mockDeleteAllPhoneNumbers = jest.fn(async () => {
  return deleteSuccess;
});
jest.mock('../assets/data.private.js', () => {
  return {
    deleteAllPhoneNumbers: mockDeleteAllPhoneNumbers,
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

test('returns result if successfully deleted', (done) => {
  deleteSuccess = true;
  const callback = (err, result) => {
    expect(err).toEqual(null);
    expect(result).toEqual({
      result: true,
    });
    done();
  };
  handler(context, event, callback);
});

test('returns already-subscribed result if storing failed', (done) => {
  deleteSuccess = false;
  const callback = (err, result) => {
    expect(err).toEqual(null);
    expect(result).toEqual({
      result: false,
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
  mockDeleteAllPhoneNumbers.mockImplementationOnce(async () => {
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
