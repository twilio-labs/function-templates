const helpers = require('../../test/test-helper');

const mockFactors = {
  factors: {
    list: jest.fn(() =>
      Promise.resolve([
        {
          sid: 'YFXXX',
        },
      ])
    ),
  },
};

const mockEntities = {
  entities: jest.fn(() => mockFactors),
};

const mockClient = {
  verify: {
    services: jest.fn(() => mockEntities),
  },
};

const testContext = {
  VERIFY_SERVICE_SID: 'default',
  IDENTITY_PROCESSING: 'hash',
  getTwilioClient: () => mockClient,
};

describe('verify-push-backend/list-factors', () => {
  beforeAll(() => {
    jest.clearAllMocks();
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
    listFactorsFunction = require('../functions/list-factors').handler;
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
    listFactorsFunction(testContext, event, callback);
  });

  test('returns success with valid request', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body[0].sid).toEqual('YFXXX');
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {
      identity: 'super-unique-id',
    };
    listFactorsFunction(testContext, event, callback);
  });
});
