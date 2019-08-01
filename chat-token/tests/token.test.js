const jwt = require('jsonwebtoken');
const tokenFunction = require('../functions/token').handler;
const helpers = require('../../test/test-helper');

const baseContext = {
  ACCOUNT_SID: 'ACxxx',
  API_KEY: 'api-key',
  API_SECRET: 'api-secret',
  CHAT_SERVICE_SID: 'default',
};

describe('chat-token/token', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns a valid token if service available in context', done => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(typeof result._body.token).toBe('string');
      jwt.verify(result._body.token, baseContext.API_SECRET, (err, decoded) => {
        expect(err).toBeNull();
        expect(decoded.iss).toBe(baseContext.API_KEY);
        expect(decoded.sub).toBe(baseContext.ACCOUNT_SID);
        expect(decoded.grants).toEqual({
          identity: 'testing-username',
          chat: {
            service_sid: baseContext.CHAT_SERVICE_SID,
          },
        });
        done();
      });
    };
    tokenFunction(baseContext, {}, callback);
  });

  test('returns a valid token if service available inline', done => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(typeof result._body.token).toBe('string');
      jwt.verify(result._body.token, baseContext.API_SECRET, (err, decoded) => {
        expect(err).toBeNull();
        expect(decoded.iss).toBe(baseContext.API_KEY);
        expect(decoded.sub).toBe(baseContext.ACCOUNT_SID);
        expect(decoded.grants).toEqual({
          identity: 'testing-username',
          chat: {
            service_sid: 'enter Chat Service Sid',
          },
        });
        done();
      });
    };
    tokenFunction(
      { ...baseContext, CHAT_SERVICE_SID: undefined },
      {},
      callback
    );
  });
});
