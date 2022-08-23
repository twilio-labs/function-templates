const lookupFunction = require('../functions/lookup').handler;
const helpers = require('../../test/test-helper');

const mockFetch = {
  fetch: jest.fn(() => Promise.resolve({ sid: 'sid' })),
};

const mockClient = {
  lookups: {
    phoneNumbers: jest.fn(() => mockFetch),
    v2: {
      phoneNumbers: jest.fn(() => mockFetch),
    },
  },
};

const testContext = {
  getTwilioClient: () => mockClient,
};

describe('international-telephone-input/lookup', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error response when required parameter is missing', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._statusCode).toEqual(400);
      done();
    };
    const event = {};
    lookupFunction(testContext, event, callback);
  });

  test('returns an error response when required parameter is empty', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._statusCode).toEqual(400);
      done();
    };
    const event = {
      phone: '',
    };
    lookupFunction(testContext, event, callback);
  });

  test('formats types into a list if only given one', (done) => {
    const event = {
      phone: '+17341234567',
      types: 'carrier',
    };
    const expectedParams = {
      type: ['carrier'],
    };
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._statusCode).toEqual(200);
      expect(mockFetch.fetch).toHaveBeenCalledWith(expectedParams);
      done();
    };
    lookupFunction(testContext, event, callback);
  });

  test('uses v2 api if lti is provided as type', (done) => {
    const event = {
      phone: '+17341234567',
      types: 'lti',
    };
    const expectedParams = {
      type: ['lti'],
    };
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._statusCode).toEqual(200);
      expect('lineTypeIntelligence' in result._body).toEqual(true);
      expect(mockFetch.fetch).toHaveBeenCalledWith(expectedParams);
      expect(mockClient.lookups.v2.phoneNumbers).toHaveBeenCalledWith(
        event.phone
      );
      done();
    };
    lookupFunction(testContext, event, callback);
  });

  test('returns success with valid request', (done) => {
    const event = {
      phone: '+17341234567',
      types: ['formatting', 'carrier'],
    };
    const expectedParams = {
      type: ['formatting', 'carrier'],
    };
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._statusCode).toEqual(200);
      expect(mockFetch.fetch).toHaveBeenCalledWith(expectedParams);
      expect(mockClient.lookups.phoneNumbers).toHaveBeenCalledWith(event.phone);
      done();
    };
    lookupFunction(testContext, event, callback);
  });
});
