const helpers = require('../../test/test-helper');

const mockChallenges = {
  challenges: {
    create: jest.fn(() =>
      Promise.resolve({
        sid: 'new-sid',
        status: 'approved',
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
  IDENTITY_PROCESSING: 'hash',
  getTwilioClient: () => mockClient,
};

describe('verify-totp-sms-fallback/create-challenge', () => {
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
    createChallengeFunction = require('../functions/create-challenge').handler;
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
    createChallengeFunction(testContext, event, callback);
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
      identity: 'super-unique-id',
      factorSid: 'YFXXX',
      code: '123456',
    };
    createChallengeFunction(testContext, event, callback);
  });

  test('returns error with invalid code', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(false);
      expect(result._body.message).toEqual(
        'Incorrect token. Check your authenticator app (or wait for the token to refresh) and try again.'
      );
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {
      identity: 'super-unique-id',
      factorSid: 'YFXXX',
      code: '654321',
    };

    mockChallenges.challenges.create.mockReturnValueOnce(
      Promise.resolve({
        sid: 'new-sid',
        status: 'pending',
      })
    );

    createChallengeFunction(testContext, event, callback);
  });
});
