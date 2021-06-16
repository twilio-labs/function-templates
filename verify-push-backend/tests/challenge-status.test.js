const helpers = require('../../test/test-helper');

const mockFetch = {
  fetch: jest.fn(() =>
    Promise.resolve({
      status: 'approved',
    })
  ),
};

const mockChallenges = {
  challenges: jest.fn(() => mockFetch),
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

describe('verify-push-backend/challenge-status', () => {
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
    challengeStatusFunction = require('../functions/challenge-status').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error response when required parameters are missing', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.error.message).toEqual(
        "Missing parameter; please provide: 'identity, sid'."
      );
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {};
    challengeStatusFunction(testContext, event, callback);
  });

  test('returns success with valid request', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.status).toEqual('approved');
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = { identity: 'super-unique-id', sid: 'my-sid' };
    challengeStatusFunction(testContext, event, callback);
  });
});
