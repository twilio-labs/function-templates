const helpers = require('../../test/test-helper');

const mockNewVerifyFactors = {
  update: jest.fn(),
};

const mockClient = {
  verify: {
    v2: {
      services: jest.fn(() => ({ newVerifyFactors: mockNewVerifyFactors })),
    },
  },
};

const mockContext = {
  VERIFY_SERVICE_SID: 'VAxxx',
  getTwilioClient: () => mockClient,
};

const testEvent = {
  id: '12345',
  rawId: 'randomRawId',
  response: {
    attestationObject: 'mockAttestationObject',
    clientDataJSON: 'mockClientDataJSON',
    transports: ['internal'],
  },
};

describe('registration/verification', () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      '/services/helpers.js',
      '../assets/services/helpers.private.js'
    );
    helpers.setup(mockContext, runtime);
    handlerFunction = require('../functions/registration/verification').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    mockNewVerifyFactors.update.mockResolvedValue({ status: 'approved' });
  });

  describe('when multiple required parameters are missing', () => {
    it('returns an error indicating multiple missing parameters', (done) => {
      const callback = (_, { _body, _statusCode }) => {
        expect(_statusCode).toEqual(400);
        expect(_body).toEqual(
          `Something is wrong with the request. Please check the parameters.`
        );
        expect(mockNewVerifyFactors.update).not.toHaveBeenCalled();
        done();
      };
      handlerFunction(mockContext, {}, callback);
    });
  });

  describe('When response are unsuccesfull', () => {
    it('returns error with unsuccesfull request', (done) => {
      const expectedError = new Error('something bad happened');
      mockNewVerifyFactors.update.mockRejectedValue(expectedError);

      const callback = (_, { _body, _statusCode }) => {
        expect(mockNewVerifyFactors.update).toHaveBeenCalledTimes(1);
        expect(_statusCode).toEqual(400);
        expect(_body).toEqual(expectedError.message);
        done();
      };

      handlerFunction(mockContext, testEvent, callback);
    });
  });

  it('maps an approved factor to a verified status', (done) => {
    const callback = (_, { _body, _statusCode }) => {
      expect(mockClient.verify.v2.services).toHaveBeenCalledWith('VAxxx');
      expect(mockNewVerifyFactors.update).toHaveBeenCalledWith({
        id: testEvent.id,
        rawId: testEvent.rawId,
        authenticatorAttachment: 'platform',
        type: 'public-key',
        response: testEvent.response,
      });
      expect(_statusCode).toEqual(200);
      expect(_body).toEqual({ status: 'verified' });
      done();
    };

    handlerFunction(mockContext, testEvent, callback);
  });

  it('accepts a flattened credential from a form encoded request', (done) => {
    const flatEvent = {
      id: testEvent.id,
      rawId: testEvent.rawId,
      ...testEvent.response,
    };

    const callback = () => {
      expect(mockNewVerifyFactors.update).toHaveBeenCalledWith({
        id: testEvent.id,
        rawId: testEvent.rawId,
        authenticatorAttachment: 'platform',
        type: 'public-key',
        response: testEvent.response,
      });
      done();
    };

    handlerFunction(mockContext, flatEvent, callback);
  });
});
