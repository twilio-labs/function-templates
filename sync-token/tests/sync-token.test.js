const jwt = require('jsonwebtoken');
const tokenFunction = require('../functions/sync-token').handler;
const helpers = require('../../test/test-helper');

const baseContext = {
  ACCOUNT_SID: 'ACxxx',
  API_KEY: 'api-key',
  API_SECRET: 'api-secret',
  SYNC_SERVICE_SID: 'default',
};

describe('sync-token/token', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns a valid token with defined sync service sid', (done) => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(typeof result._body.token).toBe('string');
      jwt.verify(result._body.token, baseContext.API_SECRET, (err, decoded) => {
        expect(err).toBeNull();
        expect(decoded.iss).toBe(baseContext.API_KEY);
        expect(decoded.sub).toBe(baseContext.ACCOUNT_SID);
        expect(decoded.grants).toEqual({
          identity: 'testing-username',
          data_sync: {
            service_sid: baseContext.SYNC_SERVICE_SID,
          },
        });
        done();
      });
    };
    tokenFunction(baseContext, {}, callback);
  });

  test('returns a valid token with fallback inline service sid', (done) => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(typeof result._body.token).toBe('string');
      jwt.verify(result._body.token, baseContext.API_SECRET, (err, decoded) => {
        expect(err).toBeNull();
        expect(decoded.iss).toBe(baseContext.API_KEY);
        expect(decoded.sub).toBe(baseContext.ACCOUNT_SID);
        expect(decoded.grants).toEqual({
          identity: 'testing-username',
          data_sync: {
            service_sid: 'enter Sync Service Sid',
          },
        });
        done();
      });
    };
    tokenFunction(
      { ...baseContext, SYNC_SERVICE_SID: undefined },
      {},
      callback
    );
  });
});
