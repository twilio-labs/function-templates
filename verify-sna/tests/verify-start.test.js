const helpers = require('../../test/test-helper');

function randomId(length) {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

describe('verify-sna/verify-start', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    const runtime = new helpers.MockRuntime();
    runtime._addAsset('/helpers/db.js', '../assets/helpers/db.private.js');
    runtime._addAsset(
      '/helpers/dbConf.js',
      '../assets/helpers/dbConf.private.js'
    );
    helpers.setup({}, runtime);
  });
  afterAll(() => {
    helpers.teardown();
  });
  beforeEach(() => jest.resetModules());

  describe('when the verification is created successfully', () => {
    it('returns a 200 status code and the sna url assigned to that verification', (done) => {
      const mockService = {
        verifications: {
          create: jest.fn(() =>
            Promise.resolve({
              to: '+14085040458',
              sna: {
                url: `https://mi.dnlsrv.com/m/id/${randomId(
                  8
                )}?data=TGSDDSFSD4`,
              },
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
          verificationStartDatabaseUpdate: db.verificationStartDatabaseUpdate,
        };
      });
      const verifyStartFunction = require('../functions/verify-start').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(200);
        expect(result._body.snaUrl).toBeDefined();
        expect(mockClient.verify.services).toHaveBeenCalledWith(
          testContext.VERIFY_SERVICE_SID
        );
        expect(mockService.verifications.create).toHaveBeenCalledWith({
          to: '+14085040458',
          channel: 'sna',
        });
        done();
      };
      const event = {
        countryCode: '+1',
        phoneNumber: '4085040458',
      };
      verifyStartFunction(testContext, event, callback);
    });
  });

  describe('when the call to the connectToDatabaseAndRunQueries function throws an error with a defined status code', () => {
    it('returns a status code different from 200 with a message of the error description', (done) => {
      const mockService = {
        verifications: {
          create: jest.fn(() =>
            Promise.resolve({
              to: '+14085040458',
              sna: {
                url: `https://mi.dnlsrv.com/m/id/${randomId(
                  8
                )}?data=TGSDDSFSD4`,
              },
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
          verificationStartDatabaseUpdate: db.verificationStartDatabaseUpdate,
        };
      });
      const verifyStartFunction = require('../functions/verify-start').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).not.toEqual(200);
        expect(result._body.message).toBeDefined();
        expect(mockClient.verify.services).toHaveBeenCalledWith(
          testContext.VERIFY_SERVICE_SID
        );
        expect(mockService.verifications.create).toHaveBeenCalledWith({
          to: '+14085040458',
          channel: 'sna',
        });
        done();
      };
      const event = {
        countryCode: '+1',
        phoneNumber: '4085040458',
      };
      verifyStartFunction(testContext, event, callback);
    });
  });

  describe('when the call to the connectToDatabaseAndRunQueries function throws an error with no status code', () => {
    it('returns a 400 status code with a message of the error description', (done) => {
      const mockService = {
        verifications: {
          create: jest.fn(() =>
            Promise.resolve({
              to: '+14085040458',
              sna: {
                url: `https://mi.dnlsrv.com/m/id/${randomId(
                  8
                )}?data=TGSDDSFSD4`,
              },
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
          verificationStartDatabaseUpdate: db.verificationStartDatabaseUpdate,
        };
      });
      const verifyStartFunction = require('../functions/verify-start').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(400);
        expect(result._body.message).toBeDefined();
        expect(mockClient.verify.services).toHaveBeenCalledWith(
          testContext.VERIFY_SERVICE_SID
        );
        expect(mockService.verifications.create).toHaveBeenCalledWith({
          to: '+14085040458',
          channel: 'sna',
        });
        done();
      };
      const event = {
        countryCode: '+1',
        phoneNumber: '4085040458',
      };
      verifyStartFunction(testContext, event, callback);
    });
  });
});
