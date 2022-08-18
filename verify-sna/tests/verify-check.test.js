const helpers = require('../../test/test-helper');

describe('verify-sna/verify-check', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    const runtime = new helpers.MockRuntime();
    runtime._addAsset('/helpers/db.js', '../assets/helpers/db.private.js');
    helpers.setup({}, runtime);
  });
  afterAll(() => {
    helpers.teardown();
  });
  beforeEach(() => jest.resetModules());

  describe('when the verification status is approved', () => {
    it('returns a 200 status code and a success flag set to true', (done) => {
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

      jest.mock('../assets/helpers/db.private.js', () => {
        const db = jest.requireActual('../assets/helpers/db.private.js');
        return {
          connectToDatabaseAndRunQueries: db.connectToDatabaseAndRunQueries,
          verificationCheckDatabaseUpdate: db.verificationCheckDatabaseUpdate,
        };
      });
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
    it('returns a 400 status code and the corresponding error code mapping', (done) => {
      const mockService = {
        verificationChecks: {
          create: jest.fn(() =>
            Promise.resolve({
              to: '+14085040458',
              status: 'pending',
              snaAttemptsErrorCodes: [
                {
                  attempt_sid: 'VLXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
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

      jest.mock('../assets/helpers/db.private.js', () => {
        const db = jest.requireActual('../assets/helpers/db.private.js');
        return {
          connectToDatabaseAndRunQueries: db.connectToDatabaseAndRunQueries,
          verificationCheckDatabaseUpdate: db.verificationCheckDatabaseUpdate,
        };
      });
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
                  attempt_sid: 'VLXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                  code: 60519,
                },
                {
                  attempt_sid: 'VLYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
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

      jest.mock('../assets/helpers/db.private.js', () => {
        const db = jest.requireActual('../assets/helpers/db.private.js');
        return {
          connectToDatabaseAndRunQueries: db.connectToDatabaseAndRunQueries,
          verificationCheckDatabaseUpdate: db.verificationCheckDatabaseUpdate,
        };
      });
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

  describe('when the call to the connectToDatabaseAndRunQueries function throws an error with a defined status code', () => {
    it('returns a status code different from 200 with a message of the error description', (done) => {
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

      jest.mock('../assets/helpers/db.private.js', () => {
        const db = jest.requireActual('../assets/helpers/db.private.js');
        const mockConnectToDatabaseAndRunQueries = jest.fn(() => {
          const error = new Error('An error occurred');
          error.status = 405;
          throw error;
        });
        return {
          connectToDatabaseAndRunQueries: mockConnectToDatabaseAndRunQueries,
          verificationCheckDatabaseUpdate: db.verificationCheckDatabaseUpdate,
        };
      });
      const verifyCheckFunction = require('../functions/verify-check').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).not.toEqual(200);
        expect(result._body.message).toBeDefined();
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

  describe('when the call to the connectToDatabaseAndRunQueries function throws an error with no status code', () => {
    it('returns a 400 status code with a message of the error description', (done) => {
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

      jest.mock('../assets/helpers/db.private.js', () => {
        const db = jest.requireActual('../assets/helpers/db.private.js');
        const mockConnectToDatabaseAndRunQueries = jest.fn(() => {
          const error = new Error('An error occurred');
          throw error;
        });
        return {
          connectToDatabaseAndRunQueries: mockConnectToDatabaseAndRunQueries,
          verificationCheckDatabaseUpdate: db.verificationCheckDatabaseUpdate,
        };
      });
      const verifyCheckFunction = require('../functions/verify-check').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(400);
        expect(result._body.message).toBeDefined();
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
