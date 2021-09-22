const helpers = require('../../test/test-helper');

const mockEntity = {
  challenges: {
    create: jest.fn().mockResolvedValue({
      status: 'approved',
    }),
  },
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

describe('verify-totp/create-challenge', () => {
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
    createChallengeFunction = require('../functions/create-challenge').handler;
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
    createChallengeFunction(testContext, event, callback);
  });

  test('returns ok when challenge is approved', (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(true);
      expect(result._body.message).toEqual('Verification success.');
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      expect(mockVerifyService.entities).toHaveBeenCalledWith(
        '85ec8262-f055-4935-8bf9-24c653fa093b'
      );
      expect(mockEntity.challenges.create).toHaveBeenCalledWith({
        authPayload: '234567',
        factorSid: 'YF123',
      });
      done();
    };
    const event = {
      identity: '85ec8262-f055-4935-8bf9-24c653fa093b',
      code: '234567',
      factorSid: 'YF123',
    };
    createChallengeFunction(testContext, event, callback);
  });

  test('throws an error for an incorrect token', (done) => {
    const mockPendingEntity = {
      challenges: {
        create: jest.fn().mockResolvedValue({
          status: 'pending',
        }),
      },
    };

    const mockPendingService = {
      entities: jest.fn(() => mockPendingEntity),
    };

    const mockPendingClient = {
      verify: {
        services: jest.fn(() => mockPendingService),
      },
    };

    const pendingContext = {
      VERIFY_SERVICE_SID: 'VAxxx',
      getTwilioClient: () => mockPendingClient,
    };

    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(false);
      expect(result._body.message).toEqual(
        'Incorrect token. Check your authenticator app (or wait for the token to refresh) and try again.'
      );
      expect(mockPendingClient.verify.services).toHaveBeenCalledWith(
        pendingContext.VERIFY_SERVICE_SID
      );
      expect(mockPendingEntity.challenges.create).toHaveBeenCalledWith({
        authPayload: '123456',
        factorSid: 'YF123',
      });
      expect(mockPendingService.entities).toHaveBeenCalledWith(
        '85ec8262-f055-4935-8bf9-24c653fa093b'
      );
      done();
    };
    const event = {
      identity: '85ec8262-f055-4935-8bf9-24c653fa093b',
      code: '123456',
      factorSid: 'YF123',
    };

    createChallengeFunction(pendingContext, event, callback);
  });
});
