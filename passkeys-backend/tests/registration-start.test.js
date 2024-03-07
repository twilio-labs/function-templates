const axios = require('axios');
const helpers = require('../../test/test-helper');

jest.mock('axios');

describe('registration/start', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      '/services/helpers.js',
      '../assets/services/helpers.private.js'
    );
    helpers.setup({}, runtime);
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
    const callback = (_err) => {
      expect(_err).toBeDefined();
      expect(_err).toEqual(`Missing parameters; please provide: 'username'.`);
      done();
    };
    handlerFunction({}, {}, callback);
  });

  it('returns error with unsuccesfull request', (done) => {
    const expectedError = new Error('something bad happened');
    axios.post = jest.fn(() => Promise.reject(expectedError));

    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedError);
      done();
    };

    handlerFunction(
      {},
      {
        username: 'test-username',
      },
      callback
    );
  });
});
