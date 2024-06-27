const axios = require('axios');
const helpers = require('../../test/test-helper');

jest.mock('axios');

const mockContext = {
  getTwilioClient: () => ({
    username: 'mockUsername',
    password: 'mockPassword',
  }),
};

describe('authentication/start', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      '/services/helpers.js',
      '../assets/services/helpers.private.js'
    );
    helpers.setup({}, runtime);
    handlerFunction = require('../functions/authentication/start').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });
  beforeEach(() => {
    jest.resetModules();
    axios.post.mockClear();
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

    handlerFunction(mockContext, {}, callback);
  });
});
