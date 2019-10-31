const startVerifyFunction = require('../functions/start-verify').handler;
const helpers = require('../../test/test-helper');

const mockService = {
  verifications: {
    create: jest.fn(() => Promise.resolve({
      sid: "my-new-sid"
    }))
  }
}

const mockClient = {
  verify: {
    services: jest.fn(() => mockService)
  }
}

const testContext = {
  VERIFY_SERVICE_SID: 'default',
  getTwilioClient: () => mockClient
};

describe('verify/start-verification', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error response when required parameters are missing', done => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(result._body.status).toEqual(false);
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(testContext.VERIFY_SERVICE_SID);
      done();
    };
    const event = {};
    startVerifyFunction(testContext, event, callback);
  });

  test('channel defaults to SMS when parameter is not provided', done => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(typeof result._body.channel).toBe('string');
      expect(result._body.channel).toEqual('sms');
      expect(mockClient.verify.services).toHaveBeenCalledWith(testContext.VERIFY_SERVICE_SID);
      done();
    };
    const event = {
      "phone_number": "+17341234567"
    }
    startVerifyFunction(testContext, event, callback);
  });
});
