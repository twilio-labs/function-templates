const helpers = require('../../test/test-helper');

const mockFactor = {
  newFactors: {
    create: jest.fn(() =>
      Promise.resolve({
        sid: 'new-factor-sid',
        binding: {
          uri: 'uri://factor',
          secret: 'so-secret',
        },
      })
    ),
  },
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

describe('verify-totp-sms-fallback/create-factor', () => {
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
    createFactorFunction = require('../functions/create-factor').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error response when required parameters are missing', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(false);
      expect(result._body.message).toEqual(
        "Missing parameter; please provide: 'name'."
      );
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {};
    createFactorFunction(testContext, event, callback);
  });

  test('returns success with valid request', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(true);
      expect(result._body.secret).toEqual('so-secret');
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {
      name: 'my new factor',
    };
    createFactorFunction(testContext, event, callback);
  });
});
