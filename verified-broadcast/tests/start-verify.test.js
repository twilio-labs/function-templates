const startVerifyFunction = require('../functions/start-verify').handler;
const helpers = require('../../test/test-helper');

const mockService = {
  verifications: {
    create: jest.fn(() =>
      Promise.resolve({
        sid: 'my-new-sid',
      })
    ),
  },
};

const mockClient = {
  verify: {
    services: jest.fn(() => mockService),
  },
};

const testContext = {
  VERIFY_SERVICE_SID: 'default',
  BROADCAST_ADMIN_NUMBER: '+12223334444',
  getTwilioClient: () => mockClient,
};

describe('verified-broadcast/start-verify', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test("uses admin number if 'to' parameter isn't provided", (done) => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(true);
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      const expectedContext = {
        channel: 'sms',
        to: testContext.BROADCAST_ADMIN_NUMBER,
      };
      expect(mockService.verifications.create).toHaveBeenCalledWith(
        expectedContext
      );
      done();
    };
    const event = {};
    startVerifyFunction(testContext, event, callback);
  });

  test('returns success with valid request', (done) => {
    const callback = (err, result) => {
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
