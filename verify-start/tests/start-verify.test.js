const startVerifyFunction = require('../functions/start-verify').handler;
const helpers = require('../../test/test-helper');

const baseContext = {
  ACCOUNT_SID: 'ACxxx',
  VERIFY_SERVICE_SID: 'default'
};

describe('verify/start-verification', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('constructs the E.164 phone number from a country_code and phone_number', done => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(typeof result._body.to).toBe('string');
      expect(result._body.to).toEqual('+17341234567');
    };
    let event = {
      "country_code": "1",
      "phone_number": "734-123-4567",
      "channel": "call"
    }
    startVerifyFunction(baseContext, event, callback);
  });

  test('channel defaults to SMS when parameter is not provided', done => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(typeof result._body.channel).toBe('string');
      expect(result._body.channel).toEqual('sms');
    };
    let event = {
      "country_code": "1",
      "phone_number": "734-123-4567"
    }
    startVerifyFunction(baseContext, event, callback);
  });

  test('returns an error response when required parameters are missing', done => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(result._body.status).toEqual(false);
    };
    startVerifyFunction(baseContext, {}, callback);
  });
});
