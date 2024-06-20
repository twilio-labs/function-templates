const verifyOtpFunction = require('../functions/verify-otp').handler;
const helpers = require('../../test/test-helper');

const mockCheck = {
  create: jest.fn(() => Promise.resolve({ sid: 'VAxxx', status: 'approved' })),
};
const mockClient = {
  verify: {
    v2: {
      services: jest.fn(() => ({
        verificationChecks: mockCheck,
      })),
    },
  },
};

const testContext = {
  VERIFY_SERVICE_SID: 'default',
  getTwilioClient: () => mockClient,
};

describe('verify/send-otp', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error with VERIFY_SERVICE_SID is missing', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result.success).toEqual(false);
      expect(result.message).toEqual('Missing VERIFY_SERVICE_SID');
      done();
    };

    const event = { phoneNumber: '+17341234567', code: '123456' };
    const contextWithoutServiceSid = { getTwilioClient: () => mockClient };
    verifyOtpFunction(contextWithoutServiceSid, event, callback);
  });

  test('returns an error with invalid code', (done) => {
    const callback = (_err, result) => {
      expect(result.success).toEqual(false);
      expect(result.message).toEqual('Verification failed. Status: pending');
      done();
    };

    mockCheck.create.mockImplementationOnce(() =>
      Promise.resolve({
        status: 'pending',
      })
    );

    const event = { phoneNumber: '+17341234567', code: '777777' };
    verifyOtpFunction(testContext, event, callback);
  });

  test('returns success with approved otp', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result.success).toEqual(true);
      expect(result.verificationSid).toEqual('VAxxx');
      done();
    };

    const event = { phoneNumber: '+17341234567', code: '123456' };
    verifyOtpFunction(testContext, event, callback);
  });
});
