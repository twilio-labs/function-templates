const helpers = require('../../test/test-helper');

const mockVerifiedFactor = {
  update: jest.fn().mockResolvedValue({
    status: 'verified',
  }),
};

const mockEntity = {
  factors: jest.fn(() => mockVerifiedFactor),
};

const mockVerifyService = {
  entities: jest.fn(() => mockEntity),
};

const mockClient = {
  verify: {
    services: jest.fn(() => mockVerifyService),
  },
};

const testContext = {
  VERIFY_SERVICE_SID: 'VAxxx',
  getTwilioClient: () => mockClient,
};

describe('verify-totp/verify-new-factor', () => {
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
    verifyFactorFunction = require('../functions/verify-new-factor').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error if required parameters are missing', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(false);
      expect(result._body.message).toEqual(
        "Missing parameter; please provide: 'identity, code, factorSid'."
      );
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {};
    verifyFactorFunction(testContext, event, callback);
  });

  test('returns ok when factor is verified', (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(true);
      expect(result._body.message).toEqual('Factor verified.');
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      expect(mockEntity.factors).toHaveBeenCalledWith('YF123');
      expect(mockVerifyService.entities).toHaveBeenCalledWith(
        '85ec8262-f055-4935-8bf9-24c653fa093b'
      );
      expect(mockVerifiedFactor.update).toHaveBeenCalledWith({
        authPayload: '234567',
      });
      done();
    };
    const event = {
      identity: '85ec8262-f055-4935-8bf9-24c653fa093b',
      code: '234567',
      factorSid: 'YF123',
    };
    verifyFactorFunction(testContext, event, callback);
  });

  test('throws an error for an incorrect token', (done) => {
    const mockUnverifiedFactor = {
      update: jest.fn().mockResolvedValue({
        status: 'pending',
      }),
    };

    const mockUnverifiedEntity = {
      factors: jest.fn(() => mockUnverifiedFactor),
    };

    const mockUnverifiedService = {
      entities: jest.fn(() => mockUnverifiedEntity),
    };

    const mockUnverifiedClient = {
      verify: {
        services: jest.fn(() => mockUnverifiedService),
      },
    };

    const unverifiedContext = {
      VERIFY_SERVICE_SID: 'VAxxx',
      getTwilioClient: () => mockUnverifiedClient,
    };

    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(false);
      expect(result._body.message).toEqual(
        'Incorrect token. Check your authenticator app (or wait for the token to refresh) and try again.'
      );
      expect(mockUnverifiedClient.verify.services).toHaveBeenCalledWith(
        unverifiedContext.VERIFY_SERVICE_SID
      );
      expect(mockUnverifiedFactor.update).toHaveBeenCalledWith({
        authPayload: '123456',
      });
      expect(mockUnverifiedEntity.factors).toHaveBeenCalledWith('YF123');
      expect(mockUnverifiedService.entities).toHaveBeenCalledWith(
        '85ec8262-f055-4935-8bf9-24c653fa093b'
      );
      done();
    };
    const event = {
      identity: '85ec8262-f055-4935-8bf9-24c653fa093b',
      code: '123456',
      factorSid: 'YF123',
    };

    verifyFactorFunction(unverifiedContext, event, callback);
  });
});
