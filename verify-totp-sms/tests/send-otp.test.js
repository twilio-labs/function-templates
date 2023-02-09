const sendOtpFunction = require('../functions/send-otp').handler;
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
  getTwilioClient: () => mockClient,
};

describe('verify-totp-sms-fallback/send-otp', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error response when required parameter is missing', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(false);
      expect(result._body.error).toEqual(
        "Missing 'to' parameter; please provide a phone number."
      );
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {};
    sendOtpFunction(testContext, event, callback);
  });

  test('returns success with valid request', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(true);
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      expect(mockService.verifications.create).toHaveBeenCalledWith({
        to: '+17341234567',
        channel: 'call',
      });
      done();
    };
    const event = { to: '+17341234567', channel: 'call' };
    sendOtpFunction(testContext, event, callback);
  });

  test('uses SMS channel as default if parameter not provided', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(true);
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      expect(mockService.verifications.create).toHaveBeenCalledWith({
        to: '+17341234567',
        channel: 'sms',
      });
      done();
    };
    const event = { to: '+17341234567' };
    sendOtpFunction(testContext, event, callback);
  });
});
