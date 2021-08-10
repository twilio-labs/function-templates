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

describe('verify-retry/check-verification', () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset('/utils.js', '../assets/utils.private.js');
    helpers.setup(testContext, runtime);
    jest.mock('../assets/utils.private.js', () => {
      const utils = jest.requireActual('../assets/utils.private.js');
      return {
        detectMissingParams: utils.detectMissingParams,
        VerificationException: utils.VerificationException,
      };
    });
    checkVerifyFunction = require('../functions/check-verify').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error response when required to parameter is missing', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(false);
      expect(result._body.message).toEqual(
        "Missing parameter; please provide: 'to'."
      );
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {
      code: '123456',
    };
    checkVerifyFunction(testContext, event, callback);
  });

  test('returns an error response when required code parameter is missing', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(false);
      expect(result._body.message).toEqual(
        "Missing parameter; please provide: 'code'."
      );
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {
      to: '+17341234567',
    };
    checkVerifyFunction(testContext, event, callback);
  });

  test('returns an error response when required parameters are missing', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(false);
      expect(result._body.message).toEqual(
        "Missing parameter; please provide: 'to, code'."
      );
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {};
    checkVerifyFunction(testContext, event, callback);
  });

  test('returns success with valid request', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(true);
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      const expectedParameters = {
        code: '123456',
        to: '+17341234567',
      };
      expect(mockService.verificationChecks.create).toHaveBeenCalledWith(
        expectedParameters
      );
      done();
    };
    const event = {
      to: '+17341234567',
      code: '123456',
    };
    checkVerifyFunction(testContext, event, callback);
  });

  test('returns error with invalid token', (done) => {
    const mockInvalidTokenService = {
      verificationChecks: {
        create: jest.fn(() =>
          Promise.resolve({
            status: 'pending',
          })
        ),
      },
    };

    const mockInvalidTokenClient = {
      verify: {
        services: jest.fn(() => mockInvalidTokenService),
      },
    };

    const invalidTokenContext = {
      getTwilioClient: () => mockInvalidTokenClient,
    };

    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(false);
      expect(result._body.message).toEqual('Incorrect token.');
      done();
    };

    const event = {
      to: '+17341234567',
      code: '1234',
    };
    checkVerifyFunction(invalidTokenContext, event, callback);
  });
});
