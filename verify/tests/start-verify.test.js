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
  getTwilioClient: () => mockClient,
};

describe('verify/start-verification', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error response when required parameters are missing', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(false);
      expect(result._body.error).toEqual(
        "Missing 'to' parameter; please provide a phone number or email."
      );
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {};
    startVerifyFunction(testContext, event, callback);
  });

  test('returns an error when "call" is the channel parameter', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(false);
      expect(result._body.error).toEqual(
        'Calls disabled by default. Update the code in <code>start-verify.js</code> to enable.'
      );
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {
      to: '+17341234567',
      channel: 'call',
    };
    startVerifyFunction(testContext, event, callback);
  });

  test('uses sms and english as the default parameters if not provied', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(true);
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      expect(mockService.verifications.create).toHaveBeenCalledWith({
        to: '+17341234567',
        channel: 'sms',
        locale: 'en',
      });
      done();
    };
    const event = { to: '+17341234567' };
    startVerifyFunction(testContext, event, callback);
  });

  test('returns success with valid request', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(true);
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      expect(mockService.verifications.create).toHaveBeenCalledWith({
        to: '+17341234567',
        channel: 'whatsapp',
        locale: 'pt-BR',
      });
      done();
    };
    const event = { to: '+17341234567', channel: 'whatsapp', locale: 'pt-BR' };
    startVerifyFunction(testContext, event, callback);
  });
});
