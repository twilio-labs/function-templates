const tokenFunction = require('../functions/redirect').handler;
const helpers = require('../../test/test-helper');

const baseContext = {
  HTTP_REDIRECT_URL: 'https://twil.io',
};

describe('video-token/token', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns a valid token with default room', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._headers).toEqual({
        Location: 'https://twil.io',
      });

      done();
    };
    tokenFunction(baseContext, {}, callback);
  });
});
