const twimlAppFunction = require("../functions/client-voice-twiml-app").handler;
const helpers = require("../../test/test-helper");

const baseContext = {
  DEFAULT_CLIENT_NAME: "bob"
};

let backupEnv;
describe("voice-client-javascript/client-voice-twiml-app", () => {
  beforeAll(() => {
    helpers.setup({});
    backupEnv = helpers.backupEnv();
  });
  beforeEach(() => {
    helpers.restoreEnv(backupEnv);
    process.env.CALLER_ID = "+18004567890";
    process.env.DEFAULT_CLIENT_NAME = "bob";
  });
  afterAll(() => {
    helpers.teardown();
  });

  test("returns TwiML with `<Dial>` when `Direction` is inbound", done => {
    const callback = (err, result) => {
      expect(result).toBeDefined();
      const twiml = result.toString();
      expect(typeof twiml).toBe("string");
      expect(twiml).toContain('<Dial>');
      expect(twiml).toContain('<Client>');
      expect(twiml).toContain('bob');
      done();
    };
    twimlAppFunction(baseContext, {Direction: "inbound"}, callback);
  });

  test("returns TwiML for `<Dial>` a `<Number>` when number provided", done => {
      const callback = (err, result) => {
        const twiml = result.toString();
        expect(typeof twiml).toBe("string");
        expect(twiml).toContain('<Number>');
        done();
      };
      twimlAppFunction(baseContext, { PhoneNumber: '+15558675309' }, callback);
  });

  test("returns TwiML for `<Dial>` a `<Client>` when name is provided", done => {
    const callback = (err, result) => {
      const twiml = result.toString();
      expect(typeof twiml).toBe("string");
      expect(twiml).toContain('<Client>');
      done();
    };
    twimlAppFunction(baseContext, { PhoneNumber: 'alice' }, callback);
});

});
