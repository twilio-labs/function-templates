/* eslint-disable camelcase */

const axios = require('axios');
const { v5 } = require('uuid');
const helpers = require('../../test/test-helper');

jest.mock('axios');

const mockContext = {
  API_URL: 'https://api.com',
  DOMAIN_NAME: 'example.com',
  SERVICE_SID: 'mockServiceSid',
  getTwilioClient: () => ({
    username: 'mockUsername',
    password: 'mockPassword',
  }),
};

const mockRequestBody = {
  friendly_name: 'user001',
  identity: v5('user001', v5.URL),
  config: {
    authenticator_attachment: 'platform',
    discoverable_credentials: 'preferred',
    user_verification: 'preferred',
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

  it('works with a phone number as a username', (done) => {
    const modifiedBody = structuredClone(mockRequestBody);
    modifiedBody.friendly_name = '+14151234567';
    modifiedBody.identity = v5('+14151234567', v5.URL);

    const callback = (_, { _body }) => {
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.com/mockServiceSid/Passkeys/Factors',
        modifiedBody,
        { auth: { password: 'mockPassword', username: 'mockUsername' } }
      );
      done();
    };

    const mockContextWithoutAndroidKeys = {
      API_URL: 'https://api.com',
      DOMAIN_NAME: 'example.com',
      SERVICE_SID: 'mockServiceSid',
      getTwilioClient: () => ({
        username: 'mockUsername',
        password: 'mockPassword',
      }),
    };

    handlerFunction(
      mockContextWithoutAndroidKeys,
      { username: '+14151234567' },
      callback
    );
  });

  it('calls the API with the expected request body', (done) => {
    const modifiedRequest = structuredClone(mockRequestBody);

    const callback = (_, result) => {
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.com/mockServiceSid/Passkeys/Factors',
        modifiedRequest,
        { auth: { password: 'mockPassword', username: 'mockUsername' } }
      );
      done();
    };

    handlerFunction(mockContext, { username: 'user001' }, callback);
  });
});
