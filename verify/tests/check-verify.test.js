const checkVerifyFunction = require('../functions/check-verify').handler;
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
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error response when required to parameter is missing', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(false);
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

  test('returns incorrect token when status is not approved', (done) => {
    const mockIncorrectTokenService = {
      verificationChecks: {
        create: jest.fn(() =>
          Promise.resolve({
            status: 'pending',
          })
        ),
      },
    };

    const mockIncorrectTokenClient = {
      verify: {
        services: jest.fn(() => mockIncorrectTokenService),
      },
    };

    const testIncorrectTokenClient = {
      VERIFY_SERVICE_SID: 'default',
      getTwilioClient: () => mockIncorrectTokenClient,
    };

    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(false);
      expect(mockIncorrectTokenClient.verify.services).toHaveBeenCalledWith(
        testIncorrectTokenClient.VERIFY_SERVICE_SID
      );
      const expectedParameters = {
        code: '6543321',
        to: '+17341234567',
      };
      expect(
        mockIncorrectTokenService.verificationChecks.create
      ).toHaveBeenCalledWith(expectedParameters);
      done();
    };
    const event = {
      to: '+17341234567',
      code: '6543321',
    };
    checkVerifyFunction(testIncorrectTokenClient, event, callback);
  });
});
