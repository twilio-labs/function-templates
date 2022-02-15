const startVerifyFunction = require('../functions/start-verify').handler;
const helpers = require('../../test/test-helper');

const mockService = {
  verifications: {
    create: jest.fn().mockResolvedValue({ sid: 'my-new-sid' }),
  },
};

const mockClient = {
  verify: {
    services: jest.fn(() => mockService),
  },
};

const mockSetupResources = jest.fn(async () => true);
jest.mock('../assets/setup.private.js', () => {
  return {
    setupResourcesIfRequired: mockSetupResources,
  };
});

const testContext = {
  VERIFY_SERVICE_SID: 'default',
  PASSCODE: 'test-code',
  BROADCAST_NOTIFY_SERVICE_SID: 'placeholder',
  TWILIO_PHONE_NUMBER: '+12223334444',
  getTwilioClient: () => mockClient,
};

describe('verified-broadcast/start-verify', () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset('/setup.js', '../assets/setup.private.js');
    helpers.setup(testContext, runtime);
  });
  afterAll(() => {
    helpers.teardown();
  });

  test("fails if 'to' parameter isn't provided", (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result._statusCode).toBe(400);
      expect(result._body.success).toEqual(false);
      expect(result._body.error).toEqual('Missing "to" parameter');
      done();
    };
    const event = {};
    startVerifyFunction(testContext, event, callback);
  });

  test('returns success with valid request', (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(true);
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      const expectedContext = { channel: 'sms', to: '+17341234567' };
      expect(mockService.verifications.create).toHaveBeenCalledWith(
        expectedContext
      );
      done();
    };
    const event = { to: '+17341234567' };
    startVerifyFunction(testContext, event, callback);
  });
});
