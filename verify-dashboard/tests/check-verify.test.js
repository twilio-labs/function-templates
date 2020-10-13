const checkVerifyFunction = require('../functions/check-verify').handler;
const helpers = require('../../test/test-helper');

const mockService = {
  verificationChecks: {
    create: jest.fn(() => Promise.resolve({
      status: "approved"
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
    const event = {
      "verification_code": "123456"
    };
    checkVerifyFunction(testContext, event, callback);
  });

  test('returns an error response when required verification_code parameter is missing', done => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(false);
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(testContext.VERIFY_SERVICE_SID);
      done();
    };
    const event = {
      "to": "+17341234567"
    };
    checkVerifyFunction(testContext, event, callback);
  });

  test('returns an error response when required parameters are missing', done => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(false);
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(testContext.VERIFY_SERVICE_SID);
      done();
    };
    const event = {};
    checkVerifyFunction(testContext, event, callback);
  });

  test('uses the verificationSid key when the to parameter is a verification SID', done => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      var expected = {"verificationSid":"VE4c972329f190f29406d82da7b4c5a64c","code":"123456"}
      expect(mockService.verificationChecks.create).toHaveBeenCalledWith(expected);
      done();
    };
    const event = {
      "to": "VE4c972329f190f29406d82da7b4c5a64c",
      "verification_code": "123456"
    };
    checkVerifyFunction(testContext, event, callback);
  });

  test('uses the \'to\' key when the to parameter is a phone number', done => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      var expected = {"to":"+12402301111","code":"123456"}
      expect(mockService.verificationChecks.create).toHaveBeenCalledWith(expected);
      done();
    };
    const event = {
      "to": "+12402301111",
      "verification_code": "123456"
    };
    checkVerifyFunction(testContext, event, callback);
  });

  test('uses the \'to\' key when the to parameter is an email', done => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      var expected = {"to":"VERONICA@GMAIL.COM","code":"123456"}
      expect(mockService.verificationChecks.create).toHaveBeenCalledWith(expected);
      done();
    };
    const event = {
      "to": "VERONICA@GMAIL.COM",
      "verification_code": "123456"
    };
    checkVerifyFunction(testContext, event, callback);
  });

  test('returns success with valid request', done => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(true);
      expect(mockClient.verify.services).toHaveBeenCalledWith(testContext.VERIFY_SERVICE_SID);
      done();
    };
    const event = {
      "to": "+17341234567",
      "verification_code": "123456"
    }
    checkVerifyFunction(testContext, event, callback);
  });
});
