const helpers = require('../../test/test-helper');

const mockApproveChallenge = {
  update: jest.fn(),
};

const mockClient = {
  verify: {
    v2: {
      services: jest.fn(() => ({ approveChallenge: mockApproveChallenge })),
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
    clientDataJSON: 'mockClientDataJSON',
    authenticatorData: 'mockAuthenticatorData',
    signature: 'test-signature',
    userHandle: 'mockUserHandle',
  },
};

describe('authentication/verification', () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      '/services/helpers.js',
      '../assets/services/helpers.private.js'
    );
    helpers.setup(mockContext, runtime);
    handlerFunction =
      require('../functions/authentication/verification').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    mockApproveChallenge.update.mockResolvedValue({
      status: 'approved',
      identity: 'mockIdentity',
    });
  });

  describe('when multiple required parameters are missing', () => {
    it('returns an error indicating multiple missing parameters', (done) => {
      const callback = (_, { _body, _statusCode }) => {
        expect(_statusCode).toEqual(400);
        expect(_body).toEqual(
          `Something is wrong with the request. Please check the parameters.`
        );
        expect(mockApproveChallenge.update).not.toHaveBeenCalled();
        done();
      };
      handlerFunction(mockContext, {}, callback);
    });
  });

  describe('When response are unsuccesfull', () => {
    it('returns error with unsuccesfull request', (done) => {
      const expectedError = new Error('something bad happened');
      mockApproveChallenge.update.mockRejectedValue(expectedError);

      const callback = (_, { _body, _statusCode }) => {
        expect(mockApproveChallenge.update).toHaveBeenCalledTimes(1);
        expect(_statusCode).toEqual(400);
        expect(_body).toEqual(expectedError.message);
        done();
      };

      handlerFunction(mockContext, testEvent, callback);
    });
  });

  it('returns the approved status and identity', (done) => {
    const callback = (_, { _body, _statusCode }) => {
      expect(mockClient.verify.v2.services).toHaveBeenCalledWith('VAxxx');
      expect(mockApproveChallenge.update).toHaveBeenCalledWith({
        id: testEvent.id,
        rawId: testEvent.rawId,
        authenticatorAttachment: 'platform',
        type: 'public-key',
        response: testEvent.response,
      });
      expect(_statusCode).toEqual(200);
      expect(_body).toEqual({ status: 'approved', identity: 'mockIdentity' });
      done();
    };

    handlerFunction(mockContext, testEvent, callback);
  });
});
