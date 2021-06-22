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

const VERIFY_SERVICE_SID = 'default';

const testContext = {
  VERIFY_SERVICE_SID,
  BROADCAST_ADMIN_NUMBER: '+12223334444',
  getTwilioClient: () => mockClient,
};

describe('verified-broadcast/broadcast', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('checks verification before broadcasting', (done) => {
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
    const event = { code: '123456', body: 'example' };
    broadcastFunction(testContext, event, callback);
  });

  test('sends broadcast if verification is successful', (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(true);
      expect(mockNotificationSubscribe.notifications.create).toHaveBeenCalled();
      done();
    };
    const event = { code: '123456', body: 'broadcast' };
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
    const event = { code: '123456', body: 'broadcast', tag: 'pie' };
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
    const event = { code: '123456', body: 'broadcast' };
    broadcastFunction(testContext, event, callback);
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
    const event = { to: '+12223334444', body: 'message' };
    broadcastFunction(failureContext, event, callback);
  });
});
