/* eslint-disable camelcase */

const axios = require('axios');
const helpers = require('../../test/test-helper');

jest.mock('axios');

const mockContext = {
  API_URL: 'https://api.com',
  DOMAIN_NAME: 'example.com',
  ANDROID_APP_KEYS: 'key1,key2,key3',
  getTwilioClient: () => ({
    username: 'mockUsername',
    password: 'mockPassword',
  }),
};

const mockRequestBody = {
  friendly_name: 'Passkey Example',
  to: {
    user_identifier: 'user001',
  },
  content: {
    relying_party: {
      id: 'example.com',
      name: 'PasskeySample',
      origins: [`https://example.com`],
    },
    user: {
      display_name: 'user001',
    },
    authenticator_criteria: {
      authenticator_attachment: 'platform',
      discoverable_credentials: 'preferred',
      user_verification: 'preferred',
    },
  },
};

describe('registration/start', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      '/services/helpers.js',
      '../assets/services/helpers.private.js'
    );
    helpers.setup(mockContext, runtime);
    handlerFunction = require('../functions/registration/start').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });
  beforeEach(() => {
    jest.resetModules();
    axios.post.mockClear();
  });

  it('returns an error response indicating the missing parameters', (done) => {
    const callback = (_, { _body, _statusCode }) => {
      expect(_statusCode).toBeDefined();
      expect(_body).toBeDefined();
      expect(_statusCode).toEqual(400);
      expect(_body).toEqual(`Missing parameters; please provide: 'username'.`);
      done();
    };
    handlerFunction(mockContext, {}, callback);
  });

  it('returns error with unsuccesfull request', (done) => {
    const expectedError = new Error('something bad happened');
    axios.post = jest.fn(() => Promise.reject(expectedError));

    const callback = (_, { _body }) => {
      expect(_body).toBeDefined();
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(_body).toEqual(expectedError.message);
      done();
    };

    handlerFunction(mockContext, { username: 'user001' }, callback);
  });

  it('works with empty ANDROID_APP_KEYS', (done) => {
    const callback = (_, { _body }) => {
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.com/Factors',
        mockRequestBody,
        { auth: { password: 'mockPassword', username: 'mockUsername' } }
      );
      done();
    };

    const mockContextWithoutAndroidKeys = {
      API_URL: 'https://api.com',
      DOMAIN_NAME: 'example.com',
      getTwilioClient: () => ({
        username: 'mockUsername',
        password: 'mockPassword',
      }),
    };

    handlerFunction(
      mockContextWithoutAndroidKeys,
      { username: 'user001' },
      callback
    );
  });

  it('calls the API with the expected request body', (done) => {
    const modifiedRequest = structuredClone(mockRequestBody);
    modifiedRequest.content.relying_party.origins.push('key1', 'key2', 'key3');

    const callback = (_, result) => {
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.com/Factors',
        modifiedRequest,
        { auth: { password: 'mockPassword', username: 'mockUsername' } }
      );
      done();
    };

    handlerFunction(mockContext, { username: 'user001' }, callback);
  });
});
