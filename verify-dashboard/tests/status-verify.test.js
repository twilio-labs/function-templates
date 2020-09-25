const statusVerifyFunction = require('../functions/status-verify').handler;
const helpers = require('../../test/test-helper');

const mockVerification = {
  fetch: jest.fn(() => Promise.resolve({
    status: "pending"
  }))
}

const mockService = {
  verifications: jest.fn(() => mockVerification)
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

describe('verification status', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error response when required \'to\' parameter is missing', done => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(false);
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(testContext.VERIFY_SERVICE_SID);
      done();
    };
    const event = {};
    statusVerifyFunction(testContext, event, callback);
  });

  test('fetches verification with the expected parameters', done => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(mockClient.verify.services).toHaveBeenCalledWith(testContext.VERIFY_SERVICE_SID);
      expect(mockService.verifications("+17341234567").fetch).toHaveBeenCalled;
      done();
    };
    const event = {"to": "+17341234567"}
    statusVerifyFunction(testContext, event, callback);
  });
});
