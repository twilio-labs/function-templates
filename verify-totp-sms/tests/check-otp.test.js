const helpers = require('../../test/test-helper');

const mockService = {
  verificationChecks: {
    create: jest.fn(() =>
      Promise.resolve({
        status: 'approved',
      })
    ),
  },
};

const mockClient = {
  verify: {
    services: jest.fn(() => mockService),
  },
};

const testContext = {
  VERIFY_SERVICE_SID: 'default',
  getTwilioClient: () => mockClient,
};

describe('verify/check-verification', () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset('/utils.js', '../assets/utils.private.js');
    helpers.setup(testContext, runtime);
    jest.mock('../assets/utils.private.js', () => {
      const missing = jest.requireActual('../assets/utils.private.js');
      return {
        detectMissingParams: missing.detectMissingParams,
      };
    });
    checkOtpFunction = require('../functions/check-otp').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error response when required to parameter is missing', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(false);
      done();
    };
    const event = {
      code: '123456',
    };
    checkOtpFunction(testContext, event, callback);
  });

  test('returns an error response when required code parameter is missing', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(false);
      done();
    };
    const event = {
      to: '+17341234567',
    };
    checkOtpFunction(testContext, event, callback);
  });

  test('returns an error response when required parameters are missing', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(false);
      done();
    };
    const event = {};
    checkOtpFunction(testContext, event, callback);
  });

  test('returns Incorrect Token with invalid code', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(false);
      expect(result._body.message).toEqual('Incorrect token.');
      done();
    };
    const event = {
      to: '+17341234567',
      code: '654321',
    };

    mockService.verificationChecks.create.mockReturnValueOnce(
      Promise.resolve({
        status: 'pending',
      })
    );
    checkOtpFunction(testContext, event, callback);
  });

  test('returns success with valid request', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(true);
      done();
    };
    const event = {
      to: '+17341234567',
      code: '123456',
    };
    checkOtpFunction(testContext, event, callback);
  });
});
