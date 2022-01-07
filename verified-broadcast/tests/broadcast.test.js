const broadcastFunction = require('../functions/broadcast').handler;
const helpers = require('../../test/test-helper');

const mockVerificationCheck = {
  verificationChecks: {
    create: jest
      .fn()
      .mockResolvedValue({ status: 'approved', sid: 'my-new-sid' }),
  },
};

const mockNotificationSubscribe = {
  notifications: {
    create: jest.fn().mockResolvedValue({}),
  },
};

const mockClient = {
  verify: {
    services: jest.fn(() => mockVerificationCheck),
  },
  notify: {
    services: jest.fn(() => mockNotificationSubscribe),
  },
};

const mockIsAuthenticated = jest.fn(() => true);
jest.mock('../assets/auth.private.js', () => {
  return {
    isAuthenticated: mockIsAuthenticated,
  };
});

const mockSetupResources = jest.fn(async () => true);
jest.mock('../assets/setup.private.js', () => {
  return {
    setupResourcesIfRequired: mockSetupResources,
  };
});

const VERIFY_SERVICE_SID = 'default';

const testContext = {
  VERIFY_SERVICE_SID,
  PASSCODE: 'test-code',
  BROADCAST_NOTIFY_SERVICE_SID: 'placeholder',
  TWILIO_PHONE_NUMBER: '+12223334444',
  getTwilioClient: () => mockClient,
};

describe('verified-broadcast/broadcast', () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset('/setup.js', '../assets/setup.private.js');
    runtime._addAsset('/auth.js', '../assets/auth.private.js');
    helpers.setup(testContext, runtime);
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('does not allow broadcasting without valid code', (done) => {
    mockIsAuthenticated.mockReturnValueOnce(false);

    const callback = (err, result) => {
      expect(err).toEqual(null);
      expect(result).toBeInstanceOf(Twilio.Response);
      expect(result._statusCode).toEqual(401);
      expect(result._body).toEqual({
        error: 'INVALID CREDENTIALS',
        success: false,
      });
      done();
    };
    const event = { body: 'example' };
    broadcastFunction(testContext, event, callback);
  });

  test('sends broadcast if password is valid', (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(true);
      expect(mockNotificationSubscribe.notifications.create).toHaveBeenCalled();
      done();
    };
    const event = { body: 'broadcast' };
    broadcastFunction(testContext, event, callback);
  });

  test('uses provided tags when provided', (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(true);
      const expectedContext = { tag: 'pie', body: 'broadcast' };
      expect(
        mockNotificationSubscribe.notifications.create
      ).toHaveBeenCalledWith(expectedContext);
      done();
    };
    const event = { body: 'broadcast', tag: 'pie' };
    broadcastFunction(testContext, event, callback);
  });

  test('uses "all" for tags if none are provided', (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(true);
      const expectedContext = { tag: 'all', body: 'broadcast' };
      expect(
        mockNotificationSubscribe.notifications.create
      ).toHaveBeenCalledWith(expectedContext);
      done();
    };
    const event = { body: 'broadcast' };
    broadcastFunction(testContext, event, callback);
  });
});
