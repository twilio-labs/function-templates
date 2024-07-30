const checkVerifyFunction = require('../functions/check-verify').handler;
const helpers = require('../../test/test-helper');

const mockClient = {
  verify: {
    v2: {
      services: jest.fn(() => ({
        verificationChecks: {
          create: jest.fn(() =>
            Promise.resolve({
              status: 'approved',
            })
          ),
        },
      })),
    },
  },
};

const testContext = {
  VERIFY_SERVICE_SID: 'default',
  getTwilioClient: () => mockClient,
};

describe('verify/check-verification', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error response when required "to" parameter is missing', (done) => {
    const callback = (_err, result) => {
      expect(result._body.success).toEqual(false);
      expect(result._body.message).toEqual(`Missing parameter.`);
      expect(mockClient.verify.v2.services).not.toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {
      code: '123456',
    };
    checkVerifyFunction(testContext, event, callback);
  });

  test('returns an error response when required "code" parameter is missing', (done) => {
    const callback = (_err, result) => {
      expect(result._body.success).toEqual(false);
      expect(result._body.message).toEqual(`Missing parameter.`);
      done();
    };
    const event = {
      to: 'foo@bar.com',
    };
    checkVerifyFunction(testContext, event, callback);
  });

  test('returns an error response when both required parameters are missing', (done) => {
    const callback = (_err, result) => {
      expect(result._body.success).toEqual(false);
      expect(result._body.message).toEqual('Missing parameter.');
      done();
    };
    const event = {};
    checkVerifyFunction(testContext, event, callback);
  });

  test('returns success with valid request', (done) => {
    const callback = (_err, result) => {
      expect(result._body.success).toEqual(true);
      expect(result._body.message).toEqual('Verification success.');
      expect(mockClient.verify.v2.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {
      to: 'hello@example.com',
      code: '123456',
    };
    checkVerifyFunction(testContext, event, callback);
  });

  test('returns error when verification fails', (done) => {
    mockClient.verify.v2.services = jest.fn(() => ({
      verificationChecks: {
        create: jest.fn(() =>
          Promise.resolve({
            status: 'pending',
          })
        ),
      },
    }));

    const callback = (_err, result) => {
      expect(result._body.success).toEqual(false);
      expect(result._body.message).toEqual('Incorrect token.');
      done();
    };
    const event = {
      to: 'hello@example.com',
      code: '00000',
    };
    checkVerifyFunction(testContext, event, callback);
  });

  test('returns a 500 error when an unexpected error occurs', (done) => {
    mockClient.verify.v2.services = jest.fn(() => {
      throw new Error('Test error');
    });

    const callback = (_err, result) => {
      expect(result._body.success).toEqual(false);
      expect(result._statusCode).toEqual(500);
      done();
    };
    const event = {
      to: 'hello@example.com',
      code: '123456',
    };
    checkVerifyFunction(testContext, event, callback);
  });
});
