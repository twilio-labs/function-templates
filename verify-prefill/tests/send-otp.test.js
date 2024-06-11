const sendOtpFunction = require('../functions/send-otp').handler;
const helpers = require('../../test/test-helper');

const mockLookup = {
  fetch: jest.fn(() => Promise.resolve({ valid: true })),
};
const mockClient = {
  verify: {
    v2: {
      services: jest.fn(() => ({
        verifications: {
          create: jest.fn(),
        },
      })),
    },
  },
  lookups: {
    v2: {
      phoneNumbers: jest.fn(() => mockLookup),
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

    const event = { phoneNumber: '+17341234567' };
    const contextWithoutServiceSid = { getTwilioClient: () => mockClient };
    sendOtpFunction(contextWithoutServiceSid, event, callback);
  });

  test('returns an error with invalid phone number', (done) => {
    const callback = (_err, result) => {
      expect(result.success).toEqual(false);
      expect(result.message).toEqual(
        'Invalid phone number. Please enter a valid number in E.164 format.'
      );
      done();
    };

    mockLookup.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        valid: false,
      })
    );

    const event = { phoneNumber: 'invalid' };
    sendOtpFunction(testContext, event, callback);
  });

  test('sends an otp with valid phone number', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result.success).toEqual(true);
      expect(result.message).toEqual('Verification sent to +17341234567');
      done();
    };

    const event = { phoneNumber: '+17341234567' };
    sendOtpFunction(testContext, event, callback);
  });
});
