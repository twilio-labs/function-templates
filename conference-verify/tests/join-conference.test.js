const joinConferenceFunction = require('../functions/join-conference.protected')
  .handler;
const helpers = require('../../test/test-helper');

//
// START: TEST SETUP
//
let verificationStatus = 'approved';

const mockService = {
  verificationChecks: {
    create: jest.fn(() =>
      Promise.resolve({
        status: verificationStatus,
      })
    ),
  },
};

const mockClient = {
  verify: {
    services: jest.fn(() => mockService),
  },
};

const testContext = {
  VERIFY_SERVICE_SID: 'default',
  MODERATOR_PHONE_NUMBER: '+1234567890',
  getTwilioClient: () => mockClient,
};

//
// END: TEST SETUP
//

describe('conference-verify/join-conference', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error response when required to parameter is missing', (done) => {
    const callback = (err, result) => {
      expect(result).toBeDefined();

      const twimlString = result.toString();
      expect(twimlString).toContain(
        `<Response><Say>Sorry I couldn't recognize your code. Please call again.</Say><Hangup/></Response>`
      );
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };

    const event = {};
    joinConferenceFunction(testContext, event, callback);
  });

  test('handles expired codes and redirects', (done) => {
    verificationStatus = 'expired';

    const callback = (err, result) => {
      expect(result).toBeDefined();

      const twimlString = result.toString();
      expect(twimlString).toContain(
        `<Response><Say>Please try again</Say><Redirect>./verify-conference</Redirect></Response>`
      );
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };

    const event = { Digits: 111111 };
    joinConferenceFunction(testContext, event, callback);
  });

  test('handles successful code verification for moderators', (done) => {
    verificationStatus = 'approved';

    const callback = (err, result) => {
      expect(result).toBeDefined();

      const twimlString = result.toString();
      expect(twimlString).toContain(
        `<Response><Say>Welcome! Joining the conference</Say><Dial><Conference startConferenceOnEnter="true" endConferenceOnExit="true">my conference</Conference></Dial></Response>`
      );
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };

    const event = { Digits: 111111, From: '+1234567890' };
    joinConferenceFunction(testContext, event, callback);
  });

  test('handles successful code verification for regular callers', (done) => {
    verificationStatus = 'approved';

    const callback = (err, result) => {
      expect(result).toBeDefined();

      const twimlString = result.toString();
      expect(twimlString).toContain(
        `<Response><Say>Welcome! Joining the conference</Say><Dial><Conference startConferenceOnEnter="false" endConferenceOnExit="false">my conference</Conference></Dial></Response>`
      );
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };

    const event = { Digits: 111111, From: '+99999999' };
    joinConferenceFunction(testContext, event, callback);
  });
});
