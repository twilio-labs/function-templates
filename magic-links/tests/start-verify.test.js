const startVerifyFunction = require('../functions/start-verify').handler;
const { callbackUrl } = require('../functions/start-verify');
const helpers = require('../../test/test-helper');

const mockService = {
  verifications: {
    create: jest.fn(() =>
      Promise.resolve({
        sid: 'my-new-sid',
      })
    ),
  },
};

const mockClient = {
  verify: {
    v2: {
      services: jest.fn(() => mockService),
    },
  },
};

const testContext = {
  VERIFY_SERVICE_SID: 'default',
  DOMAIN_NAME: 'example.com',
  CALLBACK_PATH: 'verify.html',
  getTwilioClient: () => mockClient,
};

describe('verify/start-verification', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('constructs the correct callback URL for a live URL', () => {
    const result = callbackUrl(testContext);
    expect(result).toEqual('https://example.com/verify.html');
  });

  test('constructs the correct callback URL for localhost', () => {
    const context = {
      DOMAIN_NAME: 'localhost:3000',
      CALLBACK_PATH: 'verify.html',
    };
    const result = callbackUrl(context);
    expect(result).toEqual('http://localhost:3000/verify.html');
  });

  test('returns an error response when required parameters are missing', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(false);
      expect(result._body.message).toEqual(
        'Missing parameter; please provide an email.'
      );
      expect(mockClient.verify.v2.services).not.toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {};
    startVerifyFunction(testContext, event, callback);
  });

  test('returns success with valid request', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.success).toEqual(true);
      expect(result._body.message).toEqual(
        'Sent verification to hello@example.com.'
      );
      expect(mockClient.verify.v2.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = { to: 'hello@example.com' };
    startVerifyFunction(testContext, event, callback);
  });
});
