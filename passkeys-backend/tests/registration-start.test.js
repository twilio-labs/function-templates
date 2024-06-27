const axios = require('axios');
const helpers = require('../../test/test-helper');

jest.mock('axios');

const mockContext = {
  ANDROID_APP_KEYS: 'key1,key2,key3',
  getTwilioClient: () => ({
    username: 'mockUsername',
    password: 'mockPassword',
  }),
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

    handlerFunction(
      mockContext,
      {
        username: 'test-username',
      },
      callback
    );
  });
});
