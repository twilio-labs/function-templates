const serviceDetailsFunction = require('../functions/service-details').handler;
const helpers = require('../../test/test-helper');

const mockService = {
  fetch: jest.fn(() => Promise.resolve({
    sid: "default"
  }))
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

describe('service details', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns success with valid request', done => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(true);
      expect(mockClient.verify.services).toHaveBeenCalledWith(testContext.VERIFY_SERVICE_SID);
      done();
    };
    serviceDetailsFunction(testContext, {}, callback);
  });
});
