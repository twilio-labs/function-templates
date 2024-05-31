const helpers = require('../../test/test-helper');
const { VerificationException } = require('../assets/utils.private');

const mockService = {
  verifications: {
    create: jest
      .fn()
      .mockResolvedValue({ sid: 'my-new-sid', sendCodeAttempts: [1, 2, 3] }),
  },
};

const mockLookups = {
  fetch: jest
    .fn()
    .mockResolvedValue({ lineTypeIntelligence: { type: 'mobile' } }),
};

const mockClient = {
  verify: {
    services: jest.fn(() => mockService),
  },
  lookups: {
    v2: {
      phoneNumbers: jest.fn(() => mockLookups),
    },
  },
};

const testContext = {
  VERIFY_SERVICE_SID: 'default',
  getTwilioClient: () => mockClient,
};

describe('verify-retry/start-verify', () => {
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
    startVerifyFunction = require('../functions/start-verify').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error if no phone number is provided', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(false);
      expect(result._body.message).toEqual(
        "Missing parameter; please provide: 'to'."
      );
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {};
    startVerifyFunction(testContext, event, callback);
  });

  test('uses SMS as default if no channel is provided', (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      const expectedContext = { channel: 'sms', to: '+17341234567' };
      expect(mockService.verifications.create).toHaveBeenCalledWith(
        expectedContext
      );
      done();
    };
    const event = { to: '+17341234567' };
    startVerifyFunction(testContext, event, callback);
  });

  test('looks up a phone number before sending verification code', (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(mockClient.lookups.v2.phoneNumbers).toHaveBeenCalledWith(
        '+17341234567'
      );
      done();
    };
    const event = { to: '+17341234567' };
    startVerifyFunction(testContext, event, callback);
  });

  test('uses call parameter if it detects a landline', (done) => {
    const mockLandlineLookup = {
      fetch: jest
        .fn()
        .mockResolvedValue({ lineTypeIntelligence: { type: 'landline' } }),
    };

    const mockLandlineClient = {
      verify: {
        services: jest.fn(() => mockService),
      },
      lookups: {
        v2: {
          phoneNumbers: jest.fn(() => mockLandlineLookup),
        },
      },
    };

    const landlineContext = {
      VERIFY_SERVICE_SID: 'landline-sid',
      getTwilioClient: () => mockLandlineClient,
    };

    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(true);
      expect(result._body.attempts).toEqual(3);
      expect(mockLandlineClient.verify.services).toHaveBeenCalledWith(
        landlineContext.VERIFY_SERVICE_SID
      );
      const expectedContext = { channel: 'call', to: '+17341234567' };
      expect(mockService.verifications.create).toHaveBeenCalledWith(
        expectedContext
      );
      done();
    };
    const event = { to: '+17341234567' };
    startVerifyFunction(landlineContext, event, callback);
  });

  test('returns success and attempts with valid request', (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(true);
      expect(result._body.attempts).toEqual(3);
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      const expectedContext = { channel: 'sms', to: '+17341234567' };
      expect(mockService.verifications.create).toHaveBeenCalledWith(
        expectedContext
      );
      done();
    };
    const event = { to: '+17341234567', channel: 'sms' };
    startVerifyFunction(testContext, event, callback);
  });

  test('throws an error if the lookup returns an invalid number', (done) => {
    const mockFetchError = {
      fetch: jest.fn().mockImplementation(() => {
        throw new VerificationException(404, 'Phone Number Not Found!');
      }),
    };

    const mockLookupError = {
      lookups: {
        v2: {
          phoneNumbers: jest.fn(() => mockFetchError),
        },
      },
    };

    const errorContext = {
      getTwilioClient: () => mockLookupError,
    };

    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result._body.success).toEqual(false);
      expect(result._body.message).toEqual(`Invalid phone number: '123'`);
      done();
    };
    const event = { to: '123' };
    startVerifyFunction(errorContext, event, callback);
  });
});
