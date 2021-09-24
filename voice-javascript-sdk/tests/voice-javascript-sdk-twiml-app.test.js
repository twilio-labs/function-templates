const twimlAppFunction = require('../functions/voice-javascript-sdk-twiml-app').handler;
const helpers = require('../../test/test-helper');

const baseContext = {};

let backupEnv;
describe('voice-javascript-sdk/voice-javascript-sdk-twiml-app', () => {
  beforeAll(() => {
    helpers.setup({});
    backupEnv = helpers.backupEnv();
  });
  beforeEach(() => {
    helpers.restoreEnv(backupEnv);
    process.env.CALLER_ID = '+18004567890';
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns TwiML with `<Say>` when no `To` is provided', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeDefined();
      const twiml = result.toString();
      expect(typeof twiml).toBe('string');
      expect(twiml).toContain('<Say>');
      expect(twiml).toContain('Thanks for calling');
      done();
    };
    twimlAppFunction(baseContext, {}, callback);
  });

  test('returns TwiML for `<Dial>` a `<Number>` when number provided', (done) => {
    const callback = (_err, result) => {
      const twiml = result.toString();
      expect(typeof twiml).toBe('string');
      expect(twiml).toContain('<Number>');
      done();
    };
    twimlAppFunction(baseContext, { To: '+15558675309' }, callback);
  });

  test('returns TwiML for `<Dial>` a `<Client>` when name is provided', (done) => {
    const callback = (_err, result) => {
      const twiml = result.toString();
      expect(typeof twiml).toBe('string');
      expect(twiml).toContain('<Client>');
      done();
    };
    twimlAppFunction(baseContext, { To: 'alice' }, callback);
  });
});
