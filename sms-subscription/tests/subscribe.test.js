const helpers = require('../../test/test-helper');
const { handler } = require('../functions/subscribe');

const context = {};

let storeSuccess = true;
const mockStorePhoneNumber = jest.fn(async () => {
  return storeSuccess;
});
jest.mock('../assets/data.private.js', () => {
  return {
    storePhoneNumber: mockStorePhoneNumber,
  };
});

let env;
beforeAll(() => {
  env = helpers.backupEnv();
  process.env = context;
  const runtime = new helpers.MockRuntime();
  runtime._addAsset('/data.js', '../assets/data.private.js');
  helpers.setup(context, runtime);
});
afterAll(() => {
  helpers.teardown();
  helpers.restoreEnv(env);
});

test('handles a missing phoneNumber parameter', (done) => {
  storeSuccess = true;
  const callback = (err, result) => {
    expect(err).toEqual(null);
    expect(result).toBeInstanceOf(Twilio.Response);
    expect(result._statusCode).toEqual(404);
    expect(result._body).toEqual({
      error: 'Missing phoneNumber parameter',
    });
    done();
  };
  handler(context, {}, callback);
});

test('returns subscribed result if stored successfully', (done) => {
  storeSuccess = true;
  const callback = (err, result) => {
    expect(err).toEqual(null);
    expect(result).toEqual({
      status: 'subscribed',
    });
    expect(mockStorePhoneNumber).toHaveBeenCalledWith('+12223334444');
    done();
  };
  handler(context, { phoneNumber: '+12223334444' }, callback);
});

test('returns already-subscribed result if storing failed', (done) => {
  storeSuccess = false;
  const callback = (err, result) => {
    expect(err).toEqual(null);
    expect(result).toEqual({
      status: 'already-subscribed',
    });
    expect(mockStorePhoneNumber).toHaveBeenCalledWith('+13334445555');
    done();
  };
  handler(context, { phoneNumber: '+13334445555' }, callback);
});

test('handles unexpected errors', (done) => {
  mockStorePhoneNumber.mockImplementationOnce(async () => {
    throw new Error('MOCK ERROR');
  });

  const callback = (err, result) => {
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toEqual('Server error. Please check logs.');
    expect(result).toEqual(undefined);
    done();
  };
  handler(context, { phoneNumber: '+12223334444' }, callback);
});
