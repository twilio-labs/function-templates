const path = require("path");
const helpers = require("../../../test/test-helper");
const baseDir = path.resolve("./voice-client-javascript/");

// Defined after Runtime is available
let loginFunction;
let createToken;

describe("voice-client-javascript/admin/login", () => {
  beforeAll(() => {
    helpers.setup({
      baseDir,
    });
    process.env.ADMIN_PASSWORD = "supersekret";
    return Runtime.load().then(() => {
      try {
        loginFunction = require("../../functions/admin/login").handler;
        shared = require(Runtime.getAssets()['/admin/shared.js'].path);
        createToken = shared.createToken;
      } catch (err) {
        console.error(`Error: ${err}`);
      }
    });
  });
  afterAll(() => {
    helpers.teardown();
  });

  const baseContext = {
    ACCOUNT_SID: "ACXXX",
    AUTH_TOKEN: "abcdef",
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
      const expectedToken = createToken(baseContext, process.env.ADMIN_PASSWORD);
      expect(result.token).toBe(expectedToken);
      done();
    };
    // process.env.ADMIN_PASSWORD defined in setup
    loginFunction(baseContext, {password: process.env.ADMIN_PASSWORD}, callback);
    
  });
});
