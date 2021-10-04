const helpers = require('../../test/test-helper');

const mockTokens = {
  accessTokens: {
    create: jest.fn(() =>
      Promise.resolve({
        token: 'my-new-token',
        serviceSid: 'sid',
        identity: 'identity',
        factorType: 'push',
      })
    ),
  },
};

const mockClient = {
  verify: {
    services: jest.fn(() => mockTokens),
  },
};

const testContext = {
  VERIFY_SERVICE_SID: 'default',
  IDENTITY_PROCESSING: 'hash',
  getTwilioClient: () => mockClient,
};

describe('verify-push-backend/create-access-token', () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      '/missing-params.js',
      '../assets/missing-params.private.js'
    );
    runtime._addAsset(
      '/digest-message.js',
      '../assets/digest-message.private.js'
    );
    helpers.setup(testContext, runtime);
    jest.mock('../assets/missing-params.private.js', () => {
      const missing = jest.requireActual('../assets/missing-params.private.js');
      return {
        detectMissingParams: missing.detectMissingParams,
      };
    });
    jest.mock('../assets/digest-message.private.js', () => {
      const missing = jest.requireActual('../assets/digest-message.private.js');
      return {
        digestMessage: missing.digestMessage,
      };
    });
    accessTokenFunction = require('../functions/access-token').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error response when required parameters are missing', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.error.message).toEqual(
        "Missing parameter; please provide: 'identity'."
      );
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {};
    accessTokenFunction(testContext, event, callback);
  });

  test('returns success with valid request', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.token).toEqual('my-new-token');
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = { identity: 'super-unique-id' };
    accessTokenFunction(testContext, event, callback);
  });
});
