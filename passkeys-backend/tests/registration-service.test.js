/* eslint-disable camelcase */

const helpers = require('../../test/test-helper');

const mockServices = {
  create: jest.fn(),
};

const mockClient = {
  verify: {
    v2: {
      services: mockServices,
    },
  },
};

const mockContext = {
  DOMAIN_NAME: 'example.com',
  getTwilioClient: () => mockClient,
};

describe('registration/service', () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset('/origins.js', '../assets/origins.private.js');
    runtime._addAsset(
      '/services/helpers.js',
      '../assets/services/helpers.private.js'
    );
    helpers.setup(mockContext, runtime);
    handlerFunction = require('../functions/registration/service').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    mockServices.create.mockResolvedValue({
      sid: 'VAxxx',
      friendlyName: 'Passkeys Sample Backend',
      passkeys: { authenticator_attachment: 'platform' },
    });
  });

  it('creates a passkeys enabled verify service', (done) => {
    const callback = (_, { _body, _statusCode }) => {
      expect(mockServices.create).toHaveBeenCalledWith({
        friendlyName: 'Passkeys Sample Backend',
        'passkeys.relyingParty.id': 'example.com',
        'passkeys.relyingParty.name': 'Passkeys Sample Backend',
        'passkeys.relyingParty.origins': 'https://example.com',
        'passkeys.authenticatorAttachment': 'platform',
        'passkeys.discoverableCredentials': 'preferred',
        'passkeys.userVerification': 'preferred',
      });
      expect(_statusCode).toEqual(200);
      expect(_body.sid).toEqual('VAxxx');
      done();
    };

    handlerFunction(mockContext, {}, callback);
  });

  it('returns error with unsuccesfull request', (done) => {
    const expectedError = new Error('something bad happened');
    expectedError.status = 401;
    mockServices.create.mockRejectedValue(expectedError);

    const callback = (_, { _body, _statusCode }) => {
      expect(_statusCode).toEqual(401);
      expect(_body).toEqual(expectedError.message);
      done();
    };

    handlerFunction(mockContext, {}, callback);
  });

  it('falls back to a 400 when the error carries no status', (done) => {
    mockServices.create.mockRejectedValue(new Error('something bad happened'));

    const callback = (_, { _statusCode }) => {
      expect(_statusCode).toEqual(400);
      done();
    };

    handlerFunction(mockContext, {}, callback);
  });
});
