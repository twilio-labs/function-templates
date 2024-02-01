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

  describe('when required username parameter is missing', () => {
    it('returns an error response indicating the missing parameters', (done) => {
      const { handler } = require('../functions/registration/start');
      const callback = (_err) => {
        expect(_err).toBeDefined();
        expect(_err).toEqual(`Missing parameters; please provide: 'username'.`);
        done();
      };
      handler({}, {}, callback);
    });
  });
});
