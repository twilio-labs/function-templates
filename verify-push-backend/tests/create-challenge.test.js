const helpers = require('../../test/test-helper');

const mockChallenges = {
  challenges: {
    create: jest.fn(() =>
      Promise.resolve({
        sid: 'new-sid',
        status: 'pending',
      })
    ),
  },
};

const mockEntities = {
  entities: jest.fn(() => mockChallenges),
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

describe('verify-push-backend/create-challenge', () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      '/missing-params.js',
      '../assets/missing-params.private.js'
    );
    helpers.setup(testContext, runtime);
    jest.mock('../assets/missing-params.private.js', () => {
      const missing = jest.requireActual('../assets/missing-params.private.js');
      return {
        detectMissingParams: missing.detectMissingParams,
      };
    });
    createChallengeFunction = require('../functions/create-challenge').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error response when required parameters are missing', (done) => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(result._body.error.message).toEqual(
        "Missing parameter; please provide: 'identity, message, factor'."
      );
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {};
    createChallengeFunction(testContext, event, callback);
  });

  test('returns success with valid request', (done) => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(result._body.status).toEqual('pending');
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {
      identity: 'super-unique-id',
      message: 'login request',
      factor: 'YFXXX',
    };
    createChallengeFunction(testContext, event, callback);
  });
});
