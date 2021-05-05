const helpers = require("../../test/test-helper");

const mockFactors = {
  factors: {
    list: jest.fn(() =>
      Promise.resolve([
        {
          sid: "YFXXX",
        },
      ])
    ),
  },
};

const mockEntities = {
  entities: jest.fn(() => mockFactors),
};

const mockClient = {
  verify: {
    services: jest.fn(() => mockEntities),
  },
};

const testContext = {
  VERIFY_SERVICE_SID: "default",
  getTwilioClient: () => mockClient,
};

describe("verify-push-backend/list-factors", () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      "/missing-params.js",
      "../assets/missing-params.private.js"
    );
    helpers.setup(testContext, runtime);
    jest.mock("../assets/missing-params.private.js", () => {
      const missing = jest.requireActual("../assets/missing-params.private.js");
      return {
        detectMissingParams: missing.detectMissingParams,
      };
    });
    listFactorsFunction = require("../functions/list-factors").handler;
  });
  afterAll(() => {
    helpers.teardown();
  });

  test("returns an error response when required parameters are missing", (done) => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(result._body.error.message).toEqual(
        "Missing parameter; please provide: 'entity'."
      );
      expect(mockClient.verify.services).not.toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {};
    listFactorsFunction(testContext, event, callback);
  });

  test("returns success with valid request", (done) => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      expect(result._body[0].sid).toEqual("YFXXX");
      expect(mockClient.verify.services).toHaveBeenCalledWith(
        testContext.VERIFY_SERVICE_SID
      );
      done();
    };
    const event = {
      entity: "super-unique-id",
    };
    listFactorsFunction(testContext, event, callback);
  });
});
