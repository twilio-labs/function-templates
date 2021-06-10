const jwt = require('jsonwebtoken');
const tokenFunction = require('../functions/voice-token').handler;
const helpers = require('../../test/test-helper');

const baseContext = {
  ACCOUNT_SID: 'ACxxx',
  API_KEY: 'api-key',
  API_SECRET: 'api-secret',
  TWIML_APPLICATION_SID: 'APxxx',
};

describe('voice-client-javascript/voice-token', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns a valid token with default user and expected grants', (done) => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(typeof result._body.token).toBe('string');
      jwt.verify(result._body.token, baseContext.API_SECRET, (err, decoded) => {
        expect(err).toBeNull();
        expect(decoded.iss).toBe(baseContext.API_KEY);
        expect(decoded.sub).toBe(baseContext.ACCOUNT_SID);
        expect(decoded.grants).toEqual({
          identity: 'the_user_id',
          voice: {
            incoming: {
              allow: true,
            },
            outgoing: {
              application_sid: baseContext.TWIML_APPLICATION_SID,
            },
          },
        });
        done();
      });
    };
    tokenFunction(baseContext, {}, callback);
  });
});
