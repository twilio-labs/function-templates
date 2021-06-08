const subscribeFunction = require('../functions/subscribe').handler;
const helpers = require('../../test/test-helper');

const mockVerificationCheck = {
  verificationChecks: {
    create: jest.fn(() =>
      Promise.resolve({
        sid: 'my-new-sid',
      })
    ),
  },
};

const mockNotificationSubscribe = {
  bindings: {
    create: jest.fn(() =>
      Promise.resolve({
        identity: 'my-new-identity',
      })
    ),
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

const testContext = {
  VERIFY_SERVICE_SID: 'default',
  getTwilioClient: () => mockClient,
};

describe('verified-broadcast/subscribe', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('checks verification before subscribing', (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      done();
    };
    const event = { to: '+12223334444' };
    subscribeFunction(testContext, event, callback);
  });
});
