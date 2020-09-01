const jwt = require('jsonwebtoken');
const tokenFunction = require('../functions/video-token').handler;
const helpers = require('../../test/test-helper');

const baseContext = {
  ACCOUNT_SID: 'ACxxx',
  API_KEY: 'api-key',
  API_SECRET: 'api-secret',
};

describe('video-token/token', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns a valid token with default room', (done) => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(typeof result.token).toBe('string');
      jwt.verify(result.token, baseContext.API_SECRET, (err, decoded) => {
        expect(err).toBeNull();
        expect(decoded.iss).toBe(baseContext.API_KEY);
        expect(decoded.sub).toBe(baseContext.ACCOUNT_SID);
        expect(decoded.grants.video).toEqual({
          room: 'demo',
        });
        expect(typeof decoded.grants.identity).toEqual('string');
        done();
      });
    };
    tokenFunction(baseContext, {}, callback);
  });
});
