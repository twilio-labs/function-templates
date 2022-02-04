const helpers = require('../../test/test-helper');

const mockTokens = {
  accessTokens: {
    create: jest.fn(() =>
      Promise.resolve({
        sid: 'sid',
        token: 'my-new-token',
        serviceSid: 'serviceSid',
        identity: 'identity',
        factorType: 'push',
        accountSid: 'accountSid',
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

describe('verify-push-backend/generate-qr-code', () => {
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
    generateQRCodeFunction = require('../functions/generate-qr-code').handler;
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
    generateQRCodeFunction(testContext, event, callback);
  });

  test('returns success with valid request', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      const uri = `authy://factor?accessTokenSid=sid&serviceSid=serviceSid&accountSid=accountSid`;
      expect(result._body.uri).toEqual(uri);
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = { identity: 'super-unique-id' };
    generateQRCodeFunction(testContext, event, callback);
  });
});
