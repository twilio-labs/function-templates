// const { handler } = require('../functions/registration/start');
const helpers = require('../../test/test-helper');

describe('registration/start', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      '/services/helpers.js',
      '../assets/services/helpers.private.js'
    );
    helpers.setup({}, runtime);
  });
  afterAll(() => {
    helpers.teardown();
  });
  beforeEach(() => jest.resetModules());

  describe('when multiple required parameters are missing', () => {
    it('returns an error indicating multiple missing parameters', (done) => {
      const { handler } = require('../functions/authentication/verification');
      const callback = (_err) => {
        expect(_err).toBeDefined();
        expect(_err).toEqual(
          `Missing parameters; please provide: 'id, rawId, type, clientDataJson, authenticatorData, signature, userHandle'.`
        );
        done();
      };
      handler({}, {}, callback);
    });

    it('returns an error indicating specific missing parameters', (done) => {
      const { handler } = require('../functions/authentication/verification');
      const callback = (_err) => {
        expect(_err).toBeDefined();
        expect(_err).toEqual(
          `Missing parameters; please provide: 'type, clientDataJson, authenticatorData, signature, userHandle'.`
        );
        done();
      };
      handler(
        {},
        {
          id: '123',
          rawId: '123',
        },
        callback
      );
    });
  });
});
