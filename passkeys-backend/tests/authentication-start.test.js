const helpers = require('../../test/test-helper');

const mockNewChallenge = {
  create: jest.fn(),
};

const mockClient = {
  verify: {
    v2: {
      services: jest.fn(() => ({ newChallenge: () => mockNewChallenge })),
    },
  },
};

const mockContext = {
  VERIFY_SERVICE_SID: 'VAxxx',
  getTwilioClient: () => mockClient,
};

describe('authentication/start', () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      '/services/helpers.js',
      '../assets/services/helpers.private.js'
    );
    helpers.setup(mockContext, runtime);
    handlerFunction = require('../functions/authentication/start').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    mockNewChallenge.create.mockResolvedValue({
      options: { publicKey: { challenge: 'mockChallenge' } },
    });
  });

  it('returns the challenge options', (done) => {
    const callback = (_, { _body, _statusCode }) => {
      expect(mockClient.verify.v2.services).toHaveBeenCalledWith('VAxxx');
      expect(mockNewChallenge.create).toHaveBeenCalledWith({});
      expect(_statusCode).toEqual(200);
      expect(_body).toEqual({ publicKey: { challenge: 'mockChallenge' } });
      done();
    };

    handlerFunction(mockContext, {}, callback);
  });

  it('returns error with unsuccesfull request', (done) => {
    const expectedError = new Error('something bad happened');
    mockNewChallenge.create.mockRejectedValue(expectedError);

    const callback = (_, { _body, _statusCode }) => {
      expect(mockNewChallenge.create).toHaveBeenCalledTimes(1);
      expect(_statusCode).toEqual(400);
      expect(_body).toEqual(expectedError.message);
      done();
    };

    handlerFunction(mockContext, {}, callback);
  });
});
