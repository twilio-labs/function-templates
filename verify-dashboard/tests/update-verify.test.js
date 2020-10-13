const updateVerifyFunction = require('../functions/update-verify').handler;
const helpers = require('../../test/test-helper');

const mockVerification = {
  update: jest.fn(() => Promise.resolve({
    status: "canceled"
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

describe('verify/check-verification', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error response when required to parameter is missing', done => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(false);
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(testContext.VERIFY_SERVICE_SID);
      done();
    };
    updateVerifyFunction(testContext, {}, callback);
  });

  test('returns success with valid request', done => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(mockService.verifications("VE4c972329f190f29406d82da7b4c5a64c").update).toHaveBeenCalledWith({"status":"canceled"})
      expect(result._body.success).toEqual(true);
      done();
    };
    const event = {
      "to": "VE4c972329f190f29406d82da7b4c5a64c"
    };
    updateVerifyFunction(testContext, event, callback);
  });
});
