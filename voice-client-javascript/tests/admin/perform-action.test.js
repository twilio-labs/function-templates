const helpers = require("../../../test/test-helper");

let performActionFunction;
let token;
const baseContext = {
  ACCOUNT_SID: "ACXXX",
  AUTH_TOKEN: "abcdef",
  ADMIN_PASSWORD: "supersekret",
  getTwilioClient: jest.fn(),
};

const mockSetEnvironmentVariable = jest
  .fn()
  .mockReturnValue(Promise.resolve(true));
const mockEnvironment = { serviceSid: "SERVICE_SID" };
class MockActions {
  helloWorld({ firstName }) {
    return { GREETING: `Hello ${firstName}` };
  }

  exampleInitializer() {
    return {
      INITIALIZED: "Example",
      A_KEY: "a value",
    };
  }

  noReturnValue() {}
}

describe("voice-client-javascript/admin/perform-action", () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      "/admin/shared.js",
      "../../assets/admin/shared.private.js"
    );
    runtime._addAsset(
      "/admin/actions.js",
      "../../assets/admin/actions.private.js"
    );
    helpers.setup(baseContext, runtime);
    jest.mock("../../assets/admin/actions.private.js", () => MockActions);
    const { createToken } = require("../../assets/admin/shared.private.js");
    token = createToken(baseContext, baseContext.ADMIN_PASSWORD);
    jest.mock("../../assets/admin/shared.private.js", () => {
      const shared = jest.requireActual("../../assets/admin/shared.private.js");
      return {
        getCurrentEnvironment: jest
          .fn()
          .mockReturnValue(Promise.resolve(mockEnvironment)),
        setEnvironmentVariable: mockSetEnvironmentVariable,
        checkAuthorization: shared.checkAuthorization,
        createToken: shared.createToken,
      };
    });
    performActionFunction = require("../../functions/admin/perform-action")
      .handler;
  });
  afterAll(() => {
    helpers.teardown();
  });
  test("calls must be authenticated", (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result._statusCode).toBe(403);
      expect(result._body).toBe("Not authorized");
      done();
    };
    // Note no token
    performActionFunction(baseContext, {}, callback);
  });
  test("action results are stored in environment and logged", (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result.success).toBeTruthy();
      expect(mockSetEnvironmentVariable).toHaveBeenCalledWith(
        baseContext,
        mockEnvironment,
        "GREETING",
        "Hello Ada",
        true
      );
      expect(result.logs).toContain(`Successfully set "GREETING"`);
      done();
    };
    const action = {
      name: "helloWorld",
      params: {
        firstName: "Ada",
      },
    };
    performActionFunction(baseContext, { token, action }, callback);
  });
  test("invalid action produces error", (done) => {
    const callback = (err, result) => {
      expect(err).toBeDefined();
      expect(result).toBeDefined();
      expect(result.success).toBeFalsy();
      done();
    };
    const action = {
      name: "thisDoesNotExist",
    };
    performActionFunction(baseContext, { action, token }, callback);
  });
  test("an action with INITIALIZED in the results will trigger no overriding", (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result.success).toBeTruthy();
      expect(mockSetEnvironmentVariable).toHaveBeenCalledWith(
        baseContext,
        mockEnvironment,
        "A_KEY",
        "a value",
        // False is the sign that it will not override existing values
        false
      );
      done();
    };
    const action = {
      name: "exampleInitializer",
    };
    performActionFunction(baseContext, { action, token }, callback);
  });
  test("an action that does not return values is still considered success", (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result.success).toBeTruthy();
      done();
    };
    const action = { name: "noReturnValue" };
    performActionFunction(baseContext, { action, token }, callback);
  });
  test("failure to set variables is logged", (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result.success).toBeTruthy();
      expect(result.logs).toContain(`Did not set "GREETING"`);
      done();
    };
    mockSetEnvironmentVariable.mockReturnValue(Promise.resolve(false));
    const action = {
      name: "helloWorld",
      params: {
        firstName: "Grace"
      }
    };
    performActionFunction(baseContext, {action, token}, callback);
  });
});
