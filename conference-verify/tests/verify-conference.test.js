const verifiedConferenceFunction =
  require('../functions/verify-conference.protected').handler;
const helpers = require('../../test/test-helper');
const { getExpectedBodyHash } = require('twilio/lib/webhooks/webhooks');

//
// START: TEST SETUP
//
let hasOpenVerification = false;

const mockVerificationsEndpoint = jest.fn(() => {
  return {
    fetch: jest.fn(async () => {
      if (!hasOpenVerification) {
        throw new Error('[MOCKED] No existing verification found');
      }
    }),
  };
});

let verificationCreationShouldFail = false;
mockVerificationsEndpoint.create = jest.fn(async () => {
  if (verificationCreationShouldFail) {
    throw new Error('[MOCKED] Verification creation failed');
  }
});

const mockService = {
  verifications: mockVerificationsEndpoint,
};

const mockClient = {
  verify: {
    services: jest.fn(() => mockService),
  },
};

const testContext = {
  VERIFY_SERVICE_SID: 'default',
  MODERATOR_PHONE_NUMBER: '+1234567890',
  VALID_PARTICIPANTS: '+12223334444,+13334445555',
  PATH: '/verify-conference',
  getTwilioClient: () => mockClient,
};

//
// END: TEST SETUP
//

describe('conference-verify/verify-conference', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error response when required to parameter is missing', (done) => {
    const callback = (err, result) => {
      expect(err).toEqual(
        new Error('VERIFY_SERVICE_SID has not been configured.')
      );
      done();
    };

    const event = {};
    verifiedConferenceFunction({}, event, callback);
  });

  test('blocks unknown numbers', (done) => {
    const callback = (err, result) => {
      expect(result).toBeDefined();

      const twimlString = result.toString();
      expect(twimlString).toContain(
        `<Response><Say>Sorry I don't recognize the number you are calling from.</Say></Response>`
      );

      done();
    };

    const event = {
      From: '+17778889999',
    };
    verifiedConferenceFunction(testContext, event, callback);
  });

  test('allows moderator number ', (done) => {
    const callback = (err, result) => {
      expect(result).toBeDefined();

      const twimlString = result.toString();
      expect(twimlString).toContain(
        `<Response><Gather action="./join-conference" numDigits="6" timeout="60"><Say>Please enter your code</Say></Gather><Redirect>/verify-conference</Redirect></Response>`
      );

      done();
    };

    const event = {
      From: '+1234567890',
    };
    verifiedConferenceFunction(testContext, event, callback);
  });

  test('allows regular valid number ', (done) => {
    const callback = (err, result) => {
      expect(result).toBeDefined();

      const twimlString = result.toString();
      expect(twimlString).toContain(
        `<Response><Gather action="./join-conference" numDigits="6" timeout="60"><Say>Please enter your code</Say></Gather><Redirect>/verify-conference</Redirect></Response>`
      );

      done();
    };

    const event = {
      From: '+12223334444',
    };
    verifiedConferenceFunction(testContext, event, callback);
  });

  test('sends verification if there is none open', (done) => {
    const callback = (err, result) => {
      expect(result).toBeDefined();

      const twimlString = result.toString();
      expect(twimlString).toContain(
        `<Response><Gather action="./join-conference" numDigits="6" timeout="60"><Say>Please enter your code</Say></Gather><Redirect>/verify-conference</Redirect></Response>`
      );

      hasOpenVerification = false;
      expect(mockVerificationsEndpoint).toHaveBeenCalledWith('+1234567890');
      expect(mockVerificationsEndpoint.create).toHaveBeenCalledWith({
        to: '+1234567890',
        channel: 'sms',
      });

      done();
    };

    const event = {
      From: '+1234567890',
    };
    verifiedConferenceFunction(testContext, event, callback);
  });

  test('skips sending verification if there is one', (done) => {
    const callback = (err, result) => {
      expect(result).toBeDefined();

      const twimlString = result.toString();
      expect(twimlString).toContain(
        `<Response><Gather action="./join-conference" numDigits="6" timeout="60"><Say>Please enter your code</Say></Gather><Redirect>/verify-conference</Redirect></Response>`
      );

      expect(mockVerificationsEndpoint).toHaveBeenCalledWith('+1234567890');
      expect(mockVerificationsEndpoint.create).not.toHaveBeenCalled();

      done();
    };

    const event = {
      From: '+1234567890',
    };
    hasOpenVerification = true;
    verifiedConferenceFunction(testContext, event, callback);
  });

  test('handles failed verification creation', (done) => {
    const callback = (err, result) => {
      expect(result).toBeDefined();

      const twimlString = result.toString();
      expect(twimlString).toContain(
        `<Response><Say>Failed to send verification code. Please call again.</Say></Response>`
      );

      expect(mockVerificationsEndpoint).toHaveBeenCalledWith('+1234567890');
      expect(mockVerificationsEndpoint.create).toHaveBeenCalled();

      done();
    };

    const event = {
      From: '+1234567890',
    };

    hasOpenVerification = false;
    verificationCreationShouldFail = true;
    verifiedConferenceFunction(testContext, event, callback);
  });
});
