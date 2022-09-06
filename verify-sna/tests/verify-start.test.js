const helpers = require('../../test/test-helper');

describe('verify-sna/verify-start', () => {
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
      const verifyCheckFunction = require('../functions/verify-start').handler;
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
      const verifyCheckFunction = require('../functions/verify-start').handler;
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
      const verifyCheckFunction = require('../functions/verify-start').handler;
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
});
