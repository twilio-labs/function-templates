const axios = require('axios');
const helpers = require('../../test/test-helper');

jest.mock('axios');

const testEvent = {
  id: '12345',
  rawId: 'randomRawId',
  type: 'test-type',
  clientDataJson: {},
  authenticatorData: {},
  signature: 'test-signature',
  userHandle: {},
};

describe('authentication/verification', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      '/services/helpers.js',
      '../assets/services/helpers.private.js'
    );
    helpers.setup({}, runtime);
    handlerFunction =
      require('../functions/authentication/verification').handler;
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
      const callback = (_err) => {
        expect(_err).toBeDefined();
        expect(_err).toEqual(
          `Missing parameters; please provide: 'id, rawId, type, clientDataJson, authenticatorData, signature, userHandle'.`
        );
        done();
      };
      handlerFunction({}, {}, callback);
    });

    it('returns an error indicating specific missing parameters', (done) => {
      const callback = (_err) => {
        expect(_err).toBeDefined();
        expect(_err).toEqual(
          `Missing parameters; please provide: 'type, clientDataJson, authenticatorData, signature, userHandle'.`
        );
        done();
      };
      handlerFunction(
        {},
        {
          id: '123',
          rawId: '123',
        },
        callback
      );
    });
  });

  describe('When response are unsuccesfull', () => {
    it('returns error with unsuccesfull request', (done) => {
      const expectedError = new Error('something bad happened');
      axios.post = jest.fn(() => Promise.reject(expectedError));

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedError);
        done();
      };

      handlerFunction({}, testEvent, callback);
    });
  });
});
