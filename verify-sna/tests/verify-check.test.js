const helpers = require('../../test/test-helper');

describe('verify-sna/verify-check', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    const runtime = new helpers.MockRuntime();
    runtime._addAsset('/data/config.js', '../assets/data/config.private.js');
    runtime._addAsset('/data/index.js', '../assets/data/index.private.js');
    runtime._addAsset(
      '/data/operations.js',
      '../assets/data/operations.private.js'
    );
    runtime._addAsset(
      '/services/helpers.js',
      '../assets/services/helpers.private.js'
    );
    runtime._addAsset(
      '/services/verifications.js',
      '../assets/services/verifications.private.js'
    );
    helpers.setup({}, runtime);
  });
  afterAll(() => {
    helpers.teardown();
  });
  beforeEach(() => jest.resetModules());

  describe('when required countryCode parameter is missing', () => {
    it('returns an error response indicating the missing parameters', (done) => {
      const verifyCheckFunction = require('../functions/verify-check').handler;
      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(400);
        expect(result._body.message).toBeDefined();
        expect(result._body.message).toEqual(
          `Missing parameters; please provide: 'countryCode'.`
        );
        done();
      };
      const event = {
        phoneNumber: '4085040458',
      };
      verifyCheckFunction({}, event, callback);
    });
  });

  describe('when required phoneNumber parameter is missing', () => {
    it('returns an error response indicating the missing parameters', (done) => {
      const verifyCheckFunction = require('../functions/verify-check').handler;
      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(400);
        expect(result._body.message).toBeDefined();
        expect(result._body.message).toEqual(
          `Missing parameters; please provide: 'phoneNumber'.`
        );
        done();
      };
      const event = {
        countryCode: '+57',
      };
      verifyCheckFunction({}, event, callback);
    });
  });

  describe('when required parameters are missing', () => {
    it('returns an error response indicating the missing parameters', (done) => {
      const verifyCheckFunction = require('../functions/verify-check').handler;
      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(400);
        expect(result._body.message).toBeDefined();
        expect(result._body.message).toEqual(
          `Missing parameters; please provide: 'countryCode, phoneNumber'.`
        );
        done();
      };
      verifyCheckFunction({}, {}, callback);
    });
  });

  describe('when the verification status is approved', () => {
    it('returns a 200 status code a success flag set to true', (done) => {
      const mockService = {
        verificationChecks: {
          create: jest.fn(() =>
            Promise.resolve({
              to: '+14085040458',
              status: 'approved',
              snaAttemptsErrorCodes: [],
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

      const verifyCheckFunction = require('../functions/verify-check').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(200);
        expect(result._body.success).toEqual(true);
        expect(mockClient.verify.services).toHaveBeenCalledWith(
          testContext.VERIFY_SERVICE_SID
        );
        expect(mockService.verificationChecks.create).toHaveBeenCalledWith({
          to: '+14085040458',
        });
        done();
      };
      const event = {
        countryCode: '+1',
        phoneNumber: '4085040458',
      };
      verifyCheckFunction(testContext, event, callback);
    });
  });

  describe('when the verification status is set to pending and the latest snaAttemptErrorCode is set to a pending error code', () => {
    it('returns a 400 status code and the corresponding error code', (done) => {
      const mockService = {
        verificationChecks: {
          create: jest.fn(() =>
            Promise.resolve({
              to: '+14085040458',
              status: 'pending',
              snaAttemptsErrorCodes: [
                {
                  attemptSid: 'VLXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                  code: 60519,
                },
              ],
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

      const verifyCheckFunction = require('../functions/verify-check').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(400);
        expect(result._body.errorCode).toEqual(60519);
        expect(mockClient.verify.services).toHaveBeenCalledWith(
          testContext.VERIFY_SERVICE_SID
        );
        expect(mockService.verificationChecks.create).toHaveBeenCalledWith({
          to: '+14085040458',
        });
        done();
      };
      const event = {
        countryCode: '+1',
        phoneNumber: '4085040458',
      };
      verifyCheckFunction(testContext, event, callback);
    });
  });

  describe('when the verification status is set to pending and the latest snaAttemptErrorCode is set to an unsuccessful error code', () => {
    it('returns a 200 status code and a success flag set to false', (done) => {
      const mockService = {
        verificationChecks: {
          create: jest.fn(() =>
            Promise.resolve({
              to: '+14085040458',
              status: 'pending',
              snaAttemptsErrorCodes: [
                {
                  attemptSid: 'VLXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                  code: 60519,
                },
                {
                  attemptSid: 'VLYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
                  code: 60500,
                },
              ],
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

      const verifyCheckFunction = require('../functions/verify-check').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(200);
        expect(result._body.success).toEqual(false);
        expect(result._body.errorCode).not.toEqual(60519);
        expect(mockClient.verify.services).toHaveBeenCalledWith(
          testContext.VERIFY_SERVICE_SID
        );
        expect(mockService.verificationChecks.create).toHaveBeenCalledWith({
          to: '+14085040458',
        });
        done();
      };
      const event = {
        countryCode: '+1',
        phoneNumber: '4085040458',
      };
      verifyCheckFunction(testContext, event, callback);
    });
  });

  describe('when the Verify API call throws an error with a 20404 error code', () => {
    it('returns a 404 status code and the corresponding error code', (done) => {
      const mockService = {
        verificationChecks: {
          create: jest.fn(() => {
            const error = new Error(
              'The requested resource /Services/VAff37f64d7550d4d523f8965ed5d2d08b/VerificationCheck was not found'
            );
            error.status = 404;
            error.code = 20404;
            throw error;
          }),
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

      const verifyCheckFunction = require('../functions/verify-check').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(404);
        expect(result._body.errorCode).toEqual(20404);
        expect(mockClient.verify.services).toHaveBeenCalledWith(
          testContext.VERIFY_SERVICE_SID
        );
        expect(mockService.verificationChecks.create).toHaveBeenCalledWith({
          to: '+14085040458',
        });
        done();
      };
      const event = {
        countryCode: '+1',
        phoneNumber: '4085040458',
      };
      verifyCheckFunction(testContext, event, callback);
    });
  });

  describe('when the Verify API call throws an error with a 500 status code', () => {
    it('returns a 500 status code and an error message', (done) => {
      const mockService = {
        verificationChecks: {
          create: jest.fn(() => {
            const error = new Error('Internal server error');
            error.status = 500;
            throw error;
          }),
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

      const verifyCheckFunction = require('../functions/verify-check').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(500);
        expect(result._body.message).toEqual('Internal server error');
        expect(mockClient.verify.services).toHaveBeenCalledWith(
          testContext.VERIFY_SERVICE_SID
        );
        expect(mockService.verificationChecks.create).toHaveBeenCalledWith({
          to: '+14085040458',
        });
        done();
      };
      const event = {
        countryCode: '+1',
        phoneNumber: '4085040458',
      };
      verifyCheckFunction(testContext, event, callback);
    });
  });

  describe('when the Verify API call throws an error with no status code', () => {
    it('returns a 400 status code and an error message', (done) => {
      const mockService = {
        verificationChecks: {
          create: jest.fn(() => {
            throw new Error('An error occurred');
          }),
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

      const verifyCheckFunction = require('../functions/verify-check').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(400);
        expect(result._body.message).toEqual('An error occurred');
        expect(mockClient.verify.services).toHaveBeenCalledWith(
          testContext.VERIFY_SERVICE_SID
        );
        expect(mockService.verificationChecks.create).toHaveBeenCalledWith({
          to: '+14085040458',
        });
        done();
      };
      const event = {
        countryCode: '+1',
        phoneNumber: '4085040458',
      };
      verifyCheckFunction(testContext, event, callback);
    });
  });
});
