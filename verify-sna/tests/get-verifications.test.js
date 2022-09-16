const helpers = require('../../test/test-helper');

describe('verify-sna/get-verifications', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    const runtime = new helpers.MockRuntime();
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

  describe('when the verifications are retrieved successfully from the database', () => {
    it('returns a 200 status code and an array containing the verifications', (done) => {
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

  describe('when it occurs and error while trying to get the verifications and the thrown error has a defined status code', () => {
    it('returns a status code different from 200 with a message of the error description', (done) => {
      jest.mock('../assets/services/verifications.private.js', () => {
        const verifications = jest.requireActual(
          '../assets/services/verifications.private.js'
        );
        const getVerificationsMock = jest.fn(() => {
          return new Promise((resolve, reject) => {
            const error = new Error('An error occurred');
            error.status = 405;
            return reject(error);
          });
        });
        return {
          getVerifications: getVerificationsMock,
          createVerification: verifications.createVerification,
          checkVerification: verifications.checkVerification,
        };
      });
      const getVerificationsFunction =
        require('../functions/get-verifications').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).not.toEqual(200);
        expect(result._body.message).toBeDefined();
        expect(result._body.message).toEqual('An error occurred');
        done();
      };
      getVerificationsFunction({}, {}, callback);
    });
  });

  describe('when it occurs and error while trying to get the verifications and the thrown error has no defined status code', () => {
    it('returns a 400 status code with a message of the error description', (done) => {
      jest.mock('../assets/services/verifications.private.js', () => {
        const verifications = jest.requireActual(
          '../assets/services/verifications.private.js'
        );
        const getVerificationsMock = jest.fn(() => {
          return new Promise((resolve, reject) => {
            return reject(new Error('An error occurred'));
          });
        });
        return {
          getVerifications: getVerificationsMock,
          createVerification: verifications.createVerification,
          checkVerification: verifications.checkVerification,
        };
      });
      const getVerificationsFunction =
        require('../functions/get-verifications').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(400);
        expect(result._body.message).toBeDefined();
        expect(result._body.message).toEqual('An error occurred');
        done();
      };
      getVerificationsFunction({}, {}, callback);
    });
  });
});
