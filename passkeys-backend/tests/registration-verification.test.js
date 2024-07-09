const axios = require('axios');
const helpers = require('../../test/test-helper');

jest.mock('axios');

const testEvent = {
  id: '12345',
  rawId: 'randomRawId',
  response: {
    attestationObject: {},
    clientDataJSON: {},
    transports: 'test-transport',
  },
};

const mockContext = {
  getTwilioClient: () => ({
    username: 'mockUsername',
    password: 'mockPassword',
  }),
};

describe('registration/verification', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      '/services/helpers.js',
      '../assets/services/helpers.private.js'
    );
    helpers.setup({}, runtime);
    handlerFunction = require('../functions/registration/verification').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });
  beforeEach(() => {
    jest.resetModules();
    axios.post.mockClear();
  });

  describe('when multiple required parameters are missing', () => {
    it('returns an error indicating multiple missing parameters', (done) => {
      const callback = (_, { _body, _statusCode }) => {
        expect(_statusCode).toBeDefined();
        expect(_body).toBeDefined();
        expect(_statusCode).toEqual(400);
        expect(_body).toEqual(
          `Something is wrong with the request. Please check the parameters.`
        );
        done();
      };
      handlerFunction(mockContext, {}, callback);
    });
  });

  describe('When response are unsuccesfull', () => {
    it('returns error with unsuccesfull request', (done) => {
      const expectedError = new Error('something bad happened');
      axios.post = jest.fn(() => Promise.reject(expectedError));

      const callback = (_, { _body }) => {
        expect(_body).toBeDefined();
        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(_body).toEqual(expectedError.message);
        done();
      };

      handlerFunction(mockContext, testEvent, callback);
    });
  });
});
