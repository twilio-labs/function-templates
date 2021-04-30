const accessTokenFunction = require("../functions/access-token").handler;
const helpers = require("../../test/test-helper");

const mockTokens = {
  accessTokens: {
    create: jest.fn(() =>
      Promise.resolve({
        token: "my-new-token",
        serviceSid: "sid",
        identity: "identity",
        factorType: "push",
      })
    ),
  },
};

const mockClient = {
  verify: {
    services: jest.fn(() => mockTokens),
  },
};

const testContext = {
  VERIFY_SERVICE_SID: "default",
  getTwilioClient: () => mockClient,
};

describe("verify/create-access-token", () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test("returns an error response when required parameters are missing", (done) => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(result._body.error.message).toEqual(
        "Missing parameter; please provide a unique user identity."
      );
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {};
    accessTokenFunction(testContext, event, callback);
  });

  test("returns success with valid request", (done) => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(result._body.token).toEqual("my-new-token");
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = { identity: "super-unique-id" };
    accessTokenFunction(testContext, event, callback);
  });
});
