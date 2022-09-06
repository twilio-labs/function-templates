const helpers = require('../../test/test-helper');

describe('verify-sna/remove-old-verifications', () => {
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

  describe('when the verifications are removed successfully from the database', () => {
    it('returns a 200 status code and an a message indicating that the operation was successful', (done) => {
      const removeOldVerificationsFunction =
        require('../functions/remove-old-verifications').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(200);
        expect(result._body.message).toEqual(
          'Verifications removed successfully'
        );
        done();
      };
      removeOldVerificationsFunction({}, {}, callback);
    });
  });

  describe('when it occurs and error while trying to remove the verifications and the thrown error has a defined status code', () => {
    it('returns a status code different from 200 with a message of the error description', (done) => {
      jest.mock('../assets/services/verifications.private.js', () => {
        const verifications = jest.requireActual(
          '../assets/services/verifications.private.js'
        );
        const removeOldVerificationsMock = jest.fn(() => {
          return new Promise((resolve, reject) => {
            const error = new Error('An error occurred');
            error.status = 405;
            return reject(error);
          });
        });
        return {
          removeOldVerifications: removeOldVerificationsMock,
          getVerifications: verifications.getVerifications,
          createVerification: verifications.createVerification,
          checkVerification: verifications.checkVerification,
        };
      });
      const removeOldVerificationsFunction =
        require('../functions/remove-old-verifications').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).not.toEqual(200);
        expect(result._body.message).toBeDefined();
        expect(result._body.message).toEqual('An error occurred');
        done();
      };
      removeOldVerificationsFunction({}, {}, callback);
    });
  });

  describe('when it occurs and error while trying to remove the verifications and the thrown error has no defined status code', () => {
    it('returns a status code different from 200 with a message of the error description', (done) => {
      jest.mock('../assets/services/verifications.private.js', () => {
        const verifications = jest.requireActual(
          '../assets/services/verifications.private.js'
        );
        const removeOldVerificationsMock = jest.fn(() => {
          return new Promise((resolve, reject) => {
            return reject(new Error('An error occurred'));
          });
        });
        return {
          removeOldVerifications: removeOldVerificationsMock,
          getVerifications: verifications.getVerifications,
          createVerification: verifications.createVerification,
          checkVerification: verifications.checkVerification,
        };
      });
      const removeOldVerificationsFunction =
        require('../functions/remove-old-verifications').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(400);
        expect(result._body.message).toBeDefined();
        expect(result._body.message).toEqual('An error occurred');
        done();
      };
      removeOldVerificationsFunction({}, {}, callback);
    });
  });
});
