const twimlAppFunction = require('../functions/outbound-calls').handler;
const helpers = require('../../test/test-helper');

const baseContext = {
  CALLER_ID: '18004567890',
};

let backupEnv;
describe('sip-quickstart/outbound-calls', () => {
  beforeAll(() => {
    helpers.setup({});
    backupEnv = helpers.backupEnv();
  });
  beforeEach(() => {
    helpers.restoreEnv(backupEnv);
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns TwiML for `<Dial>` a `<Number>` when number provided', (done) => {
    const callback = (_err, result) => {
      const twiml = result.toString();
      expect(typeof twiml).toBe('string');
      expect(twiml).toContain('<Dial callerId="18004567890">+15558675309');
      done();
    };
    twimlAppFunction(
      baseContext,
      { To: 'sip:+15558675309@sip.us1.blarghduck.com' },
      callback
    );
  });

  test('returns TwiML for `<Dial>` a `<Sip>` when name is provided', (done) => {
    const callback = (_err, result) => {
      const twiml = result.toString();
      expect(typeof twiml).toBe('string');
      expect(twiml).toContain('<Dial>');
      expect(twiml).toContain('<Sip>sip:alice@');
      done();
    };
    twimlAppFunction(
      baseContext,
      { To: 'sip:alice@sip.us1.blarghduck.com' },
      callback
    );
  });
});
