/* eslint-disable camelcase */
const lookupFunction = require('../functions/lookup').handler;
const { getErrorLinks } = require('../functions/lookup');
const helpers = require('../../test/test-helper');

const mockFetch = {
  fetch: jest.fn(() =>
    Promise.resolve({
      valid: true,
      sid: 'sid',
    })
  ),
};

const mockClient = {
  lookups: {
    v2: {
      phoneNumbers: jest.fn(() => mockFetch),
    },
  },
};

const testContext = {
  getTwilioClient: () => mockClient,
};

describe('lookup', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error response when required phone number parameter is missing', (done) => {
    const callback = (_err, result) => {
      expect(result._statusCode).toEqual(400);
      expect(result._body).toEqual({
        error: 'Missing parameter; please provide a phone number.',
      });
      done();
    };
    const event = {};
    lookupFunction(testContext, event, callback);
  });

  test('returns an error response when required parameter is empty', (done) => {
    const callback = (_err, result) => {
      expect(result._statusCode).toEqual(400);
      expect(result._body).toEqual({
        error: 'Missing parameter; please provide a phone number.',
      });
      done();
    };
    const event = {
      phone: '',
    };
    lookupFunction(testContext, event, callback);
  });

  test('throws an error with an invalid phone number', (done) => {
    const event = {
      phone: '+12345',
      fields: ['validation'],
    };

    const mockInvalidFetch = {
      fetch: jest.fn(() =>
        Promise.resolve({
          valid: false,
          validationErrors: 'TOO_SHORT',
          sid: 'sid',
        })
      ),
    };

    const mockInvalidPhoneClient = {
      lookups: {
        v2: {
          phoneNumbers: jest.fn(() => mockInvalidFetch),
        },
      },
    };

    const testInvalidPhoneContext = {
      getTwilioClient: () => mockInvalidPhoneClient,
    };

    const callback = (_err, result) => {
      expect(result._statusCode).toEqual(400);
      expect(result._body).toEqual({
        error: 'Invalid phone number: TOO_SHORT.',
      });
      done();
    };
    lookupFunction(testInvalidPhoneContext, event, callback);
  });

  test('transforms data into error links', (done) => {
    const data = {
      simSwap: {
        error_code: 60008,
      },
      callForwarding: {
        call_forwarding_enabled: null,
        error_code: 60607,
      },
    };

    const expected = [
      'simSwap error: <a href="https://www.twilio.com/docs/api/errors/60008">60008</a>',
      'callForwarding error: <a href="https://www.twilio.com/docs/api/errors/60607">60607</a>',
    ];

    const result = getErrorLinks(data);
    expect(result).toEqual(expected);
    done();
  });

  test('throws an error when there are nested errors in the data', (done) => {
    const event = {
      phone: '+17341234567',
      fields: ['validation'],
    };

    const mockErrorsFetch = {
      fetch: jest.fn(() =>
        Promise.resolve({
          valid: true,
          simSwap: {
            error_code: 60008,
          },
          callForwarding: {
            call_forwarding_enabled: null,
            error_code: 60607,
          },
        })
      ),
    };

    const mockErrorsClient = {
      lookups: {
        v2: {
          phoneNumbers: jest.fn(() => mockErrorsFetch),
        },
      },
    };

    const testErrorsContext = {
      getTwilioClient: () => mockErrorsClient,
    };

    const callback = (_err, result) => {
      expect(result._statusCode).toEqual(400);
      expect(result._body).toEqual({
        error:
          'simSwap error: <a href="https://www.twilio.com/docs/api/errors/60008">60008</a><br/>callForwarding error: <a href="https://www.twilio.com/docs/api/errors/60607">60607</a>',
      });
      done();
    };
    lookupFunction(testErrorsContext, event, callback);
  });

  test('returns success with valid request', (done) => {
    const event = {
      phone: '+17341234567',
      fields: ['validation', 'line_type_intelligence'],
    };

    const callback = (_err, result) => {
      expect(result._statusCode).toEqual(200);
      expect(mockFetch.fetch).toHaveBeenCalledWith({
        fields: 'validation,line_type_intelligence',
      });
      expect(mockClient.lookups.v2.phoneNumbers).toHaveBeenCalledWith(
        event.phone
      );
      done();
    };
    lookupFunction(testContext, event, callback);
  });
});
