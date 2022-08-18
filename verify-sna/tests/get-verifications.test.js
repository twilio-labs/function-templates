const helpers = require('../../test/test-helper');

describe('verify-sna/get-verifications', () => {
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

  describe('when the verifications are retrieved successfully from the database', () => {
    it('returns a 200 status code and a verifications array', (done) => {
      // mock for this test
      jest.mock('../assets/helpers/db.private.js', () => {
        const db = jest.requireActual('../assets/helpers/db.private.js');
        return {
          connectToDatabaseAndRunQueries: db.connectToDatabaseAndRunQueries,
          getVerifications: db.getVerifications,
        };
      });
      const getVerificationsFunction =
        require('../functions/get-verifications').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(200);
        expect(result._body.verifications).toBeDefined();
        done();
      };
      getVerificationsFunction({}, {}, callback);
    });
  });

  describe('when the call to the connectToDatabaseAndRunQueries function throws an error with a defined status code', () => {
    it('returns a status code different from 200 with a message of the error description', (done) => {
      // mock for this test
      jest.mock('../assets/helpers/db.private.js', () => {
        const db = jest.requireActual('../assets/helpers/db.private.js');
        const mockConnectToDatabaseAndRunQueries = jest.fn(() => {
          const error = new Error('An error occurred');
          error.status = 405;
          throw error;
        });
        return {
          connectToDatabaseAndRunQueries: mockConnectToDatabaseAndRunQueries,
          getVerifications: db.getVerifications,
        };
      });
      const getVerificationsFunction =
        require('../functions/get-verifications').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).not.toEqual(200);
        expect(result._body.message).toBeDefined();
        done();
      };
      getVerificationsFunction({}, {}, callback);
    });
  });

  describe('when the call to the connectToDatabaseAndRunQueries function throws an error with no status code', () => {
    it('returns a 400 status code with a message of the error description', (done) => {
      // mock for this test
      jest.mock('../assets/helpers/db.private.js', () => {
        const db = jest.requireActual('../assets/helpers/db.private.js');
        const mockConnectToDatabaseAndRunQueries = jest.fn(() => {
          const error = new Error('An error occurred');
          throw error;
        });
        return {
          connectToDatabaseAndRunQueries: mockConnectToDatabaseAndRunQueries,
          getVerifications: db.getVerifications,
        };
      });
      const getVerificationsFunction =
        require('../functions/get-verifications').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(400);
        expect(result._body.message).toBeDefined();
        done();
      };
      getVerificationsFunction({}, {}, callback);
    });
  });
});
