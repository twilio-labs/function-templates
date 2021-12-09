const subscribeFunction = require('../functions/subscribe').handler;
const helpers = require('../../test/test-helper');

const mockVerificationCheck = {
  verificationChecks: {
    create: jest
      .fn()
      .mockResolvedValue({ status: 'approved', sid: 'my-new-sid' }),
  },
};

const mockNotificationSubscribe = {
  bindings: {
    create: jest.fn().mockResolvedValue({ sid: 'my-new-identity' }),
  },
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

const mockSetupResources = jest.fn(async () => true);
jest.mock('../assets/setup.private.js', () => {
  return {
    setupResourcesIfRequired: mockSetupResources,
  };
});

const VERIFY_SERVICE_SID = 'default';

const testContext = {
  VERIFY_SERVICE_SID,
  AUTH_USERNAME: 'admin',
  AUTH_PASSCODE: 'test-code',
  BROADCAST_NOTIFY_SERVICE_SID: 'placeholder',
  TWILIO_PHONE_NUMBER: '+12223334444',
  getTwilioClient: () => mockClient,
};

describe('verified-broadcast/subscribe', () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset('/setup.js', '../assets/setup.private.js');
    helpers.setup(testContext, runtime);
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('checks verification before subscribing', (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        VERIFY_SERVICE_SID
      );
      const expectedContext = {
        code: '123456',
        to: '+12223334444',
      };
      expect(
        mockVerificationCheck.verificationChecks.create
      ).toHaveBeenCalledWith(expectedContext);
      expect(result._body.success).toEqual(true);
      done();
    };
    const event = { to: '+12223334444', code: '123456' };
    subscribeFunction(testContext, event, callback);
  });

  test('subscribes user if verification is successful', (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(true);
      expect(mockNotificationSubscribe.bindings.create).toHaveBeenCalled();
      expect(mockNotificationSubscribe.notifications.create).toHaveBeenCalled();
      done();
    };
    const event = { to: '+12223334444', code: '123456' };
    subscribeFunction(testContext, event, callback);
  });

  test('returns "incorrect token" if verification fails', (done) => {
    const mockFailureVerificationCheck = {
      verificationChecks: {
        create: jest
          .fn()
          .mockResolvedValue({ status: 'pending', sid: 'my-new-sid' }),
      },
    };

    const mockFailureClient = {
      verify: {
        services: jest.fn(() => mockFailureVerificationCheck),
      },
      notify: {
        services: jest.fn(() => mockNotificationSubscribe),
      },
    };

    const failureContext = {
      VERIFY_SERVICE_SID,
      getTwilioClient: () => mockFailureClient,
    };

    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(false);
      expect(result._body.error).toEqual('Incorrect token.');
      done();
    };
    const event = { to: '+12223334444', code: '123456' };
    subscribeFunction(failureContext, event, callback);
  });
});
