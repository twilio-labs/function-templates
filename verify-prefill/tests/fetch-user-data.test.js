const fetch = require('node-fetch');
const fetchUserDataFunction = require('../functions/fetch-user-data').handler;
const helpers = require('../../test/test-helper');

const testContext = {
  LOOKUP_API_KEY: 'foo',
  LOOKUP_API_SECRET: 'bar',
};

jest.mock('node-fetch', () => jest.fn());

describe('verify-prefill/fetch-user-data', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns success with valid request', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result.success).toEqual(true);
      expect(result.prefillData).toBeDefined();
      done();
    };

    const lookupResponse = Promise.resolve({
      json: () =>
        Promise.resolve({
          pre_fill: 'mydata', // eslint-disable-line camelcase
        }),
    });
    fetch.mockImplementation(() => lookupResponse);

    const event = {
      phoneNumber: '+17341234567',
      verificationSid: 'VExxkasjdf',
    };
    fetchUserDataFunction(testContext, event, callback);
  });
});
