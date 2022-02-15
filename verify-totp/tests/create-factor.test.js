const helpers = require('../../test/test-helper');

const mockFactors = {
  newFactors: {
    create: jest.fn().mockResolvedValue({
      sid: 'YF123',
      binding: {
        uri: 'otpauth://totp/sample:kelley?secret=LJP25ZQVNV5QS3HC5DNM2FZPS&issuer=TOTP&period=30',
        secret: 'LJP25ZQVNV5QS3HC5DNM2FZPS',
      },
    }),
  },
};

const mockVerifyService = {
  entities: jest.fn(() => mockFactors),
};

const mockClient = {
  verify: {
    services: jest.fn(() => mockVerifyService),
  },
};

const testContext = {
  VERIFY_SERVICE_SID: 'VAxxx',
  getTwilioClient: () => mockClient,
};

describe('verify-totp/create-factor', () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset('/utils.js', '../assets/utils.private.js');
    helpers.setup(testContext, runtime);
    jest.mock('../assets/utils.private.js', () => {
      const utils = jest.requireActual('../assets/utils.private.js');
      return {
        detectMissingParams: utils.detectMissingParams,
        VerificationException: utils.VerificationException,
      };
    });
    createFactorFunction = require('../functions/create-factor').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error response when required name parameter is missing', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(false);
      expect(result._body.message).toEqual(
        "Missing parameter; please provide: 'name'."
      );
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {};
    createFactorFunction(testContext, event, callback);
  });

  test('returns ok with valid request', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      expect(result._body.ok).toEqual(true);
      expect(result._body.factorSid).toEqual('YF123');
      expect(result._body.secret).toEqual('LJP25ZQVNV5QS3HC5DNM2FZPS');
      expect(result._body.uri).toEqual(
        'otpauth://totp/sample:kelley?secret=LJP25ZQVNV5QS3HC5DNM2FZPS&issuer=TOTP&period=30'
      );
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      const expectedParameters = {
        friendlyName: 'myusername',
        factorType: 'totp',
      };
      expect(mockFactors.newFactors.create).toHaveBeenCalledWith(
        expectedParameters
      );
      done();
    };
    const event = {
      name: 'myusername',
    };
    createFactorFunction(testContext, event, callback);
  });
});
