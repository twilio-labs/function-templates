const helpers = require('../../test/test-helper');

const mockUpdate = {
  update: jest.fn(() =>
    Promise.resolve({
      status: 'verified',
    })
  ),
};

const mockFactor = {
  factors: jest.fn(() => mockUpdate),
};

const mockEntities = {
  entities: jest.fn(() => mockFactor),
};

const mockClient = {
  verify: {
    services: jest.fn(() => mockEntities),
  },
};

const testContext = {
  VERIFY_SERVICE_SID: 'default',
  getTwilioClient: () => mockClient,
};

describe('verify-totp-sms-fallback/verify-new-factor', () => {
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
    verifyFactorFunction = require('../functions/verify-new-factor').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error response when required parameters are missing', (done) => {
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

  test('returns success with valid request', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(true);
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {
      identity: 'id',
      code: '123456',
      factorSid: 'my sid',
    };
    verifyFactorFunction(testContext, event, callback);
  });

  test('returns error with incorrect token', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(false);
      expect(result._body.message).toEqual('Incorrect code.');
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {
      identity: 'id',
      code: '654321',
      factorSid: 'my sid',
    };

    mockUpdate.update.mockReturnValueOnce(
      Promise.resolve({
        status: 'pending',
      })
    );

    verifyFactorFunction(testContext, event, callback);
  });
});
