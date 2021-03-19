const helpers = require("../../../test/test-helper");

// Defined after Runtime is available
let loginFunction;
let createToken;

describe("voice-client-javascript/admin/login", () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset("/admin/shared.js", "../../assets/admin/shared.private.js");
    helpers.setup({}, runtime);
    loginFunction = require("../../functions/admin/login").handler;
    shared = require(Runtime.getAssets()['/admin/shared.js'].path);
    createToken = shared.createToken;
  });
  afterAll(() => {
    helpers.teardown();
  });

  const baseContext = {
    ACCOUNT_SID: "ACXXX",
    AUTH_TOKEN: "abcdef",
    ADMIN_PASSWORD: "supersekret",
  };

  test("missing token throws 403", (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result._statusCode).toBe(403);
      done();
    };
    loginFunction(baseContext, {}, callback);
  });
  
  test("incorrect password throws 403", (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result._statusCode).toBe(403);
      done();
    };
    loginFunction(baseContext, {password: "this is not right"}, callback);
  });

  test("correct password returns token", (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      const expectedToken = createToken(baseContext, baseContext.ADMIN_PASSWORD);
      expect(result.token).toBe(expectedToken);
      done();
    };
    loginFunction(baseContext, {password: baseContext.ADMIN_PASSWORD}, callback);
    
  });
});
