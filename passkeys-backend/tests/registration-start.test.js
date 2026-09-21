/* eslint-disable camelcase */

const { v5 } = require('uuid');
const helpers = require('../../test/test-helper');

const mockNewFactors = {
  create: jest.fn(),
};

const mockClient = {
  verify: {
    v2: {
      services: jest.fn(() => ({ newFactors: mockNewFactors })),
    },
  },
};

const mockContext = {
  DOMAIN_NAME: 'example.com',
  VERIFY_SERVICE_SID: 'VAxxx',
  getTwilioClient: () => mockClient,
};

const expectedRequest = (username) => ({
  friendly_name: username,
  identity: v5(username, v5.URL),
  config: {
    authenticator_attachment: 'platform',
    discoverable_credentials: 'preferred',
    user_verification: 'preferred',
  },
});

describe('registration/start', () => {
  beforeAll(() => {
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
    jest.clearAllMocks();
    mockNewFactors.create.mockResolvedValue({
      options: { publicKey: { challenge: 'mockChallenge' } },
    });
  });

  it('returns an error response indicating the missing parameters', (done) => {
    const callback = (_, { _body, _statusCode }) => {
      expect(_statusCode).toEqual(400);
      expect(_body).toEqual(`Missing parameters; please provide: 'username'.`);
      expect(mockNewFactors.create).not.toHaveBeenCalled();
      done();
    };
    handlerFunction(mockContext, {}, callback);
  });

  it('returns error with unsuccesfull request', (done) => {
    const expectedError = new Error('something bad happened');
    expectedError.status = 503;
    mockNewFactors.create.mockRejectedValue(expectedError);

    const callback = (_, { _body, _statusCode }) => {
      expect(mockNewFactors.create).toHaveBeenCalledTimes(1);
      expect(_statusCode).toEqual(503);
      expect(_body).toEqual(expectedError.message);
      done();
    };

    handlerFunction(mockContext, { username: 'user001' }, callback);
  });

  it('works with a phone number as a username', (done) => {
    const callback = () => {
      expect(mockClient.verify.v2.services).toHaveBeenCalledWith('VAxxx');
      expect(mockNewFactors.create).toHaveBeenCalledWith(
        expectedRequest('+14151234567')
      );
      done();
    };

    handlerFunction(mockContext, { username: '+14151234567' }, callback);
  });

  it('calls the API with the expected request body', (done) => {
    const callback = (_, { _body, _statusCode }) => {
      expect(mockNewFactors.create).toHaveBeenCalledWith(
        expectedRequest('user001')
      );
      expect(_statusCode).toEqual(200);
      expect(_body).toEqual({
        challenge: 'mockChallenge',
        identity: v5('user001', v5.URL),
      });
      done();
    };

    handlerFunction(mockContext, { username: 'user001' }, callback);
  });
});
