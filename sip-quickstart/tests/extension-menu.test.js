const extensions = require('../assets/extensions.private');
const helpers = require('../../test/test-helper');

const mockDomainFetch = jest.fn(() => {
  return {
    sid: 'DO123',
    domainName: 'mocked.sip.twilio.com',
  };
});
const mockTwilioClient = {
  sip: {
    domains: jest.fn(() => {
      return {
        fetch: mockDomainFetch,
      };
    }),
  },
};

const baseContext = {
  CALLER_ID: '18004567890',
  getTwilioClient: jest.fn(() => mockTwilioClient),
};

let backupEnv;
let twimlAppFunction;
describe('sip-quickstart/extension-menu', () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset('/extensions.js', '../assets/extensions.private.js');
    helpers.setup(baseContext, runtime);
    twimlAppFunction = require('../functions/extension-menu').handler;
    backupEnv = helpers.backupEnv();
  });
  beforeEach(() => {
    helpers.restoreEnv(backupEnv);
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('it prompts when there are no digits', (done) => {
    const callback = (_err, result) => {
      const twiml = result.toString();
      expect(typeof twiml).toBe('string');
      expect(twiml).toContain('<Say>Please enter the extension');
      done();
    };
    twimlAppFunction(baseContext, {}, callback);
  });

  test('it provides a menu of extensions when 0 is sent', (done) => {
    const callback = (_err, result) => {
      const twiml = result.toString();
      expect(typeof twiml).toBe('string');
      extensions.forEach((ext) =>
        expect(twiml).toContain(`For ${ext.name}, press ${ext.extension}`)
      );
      done();
    };
    twimlAppFunction(baseContext, { Digits: '0' }, callback);
  });

  test('it dials a extension when pressed', (done) => {
    const ext = extensions[0];
    const callback = (_err, result) => {
      const twiml = result.toString();
      expect(typeof twiml).toBe('string');
      expect(twiml).toContain(`<Dial><Sip>sip:${ext.username}`);
      // Ensure
      expect(twiml).toContain('@mocked.sip.us1.twilio.com');
      done();
    };
    twimlAppFunction(baseContext, { Digits: ext.extension }, callback);
  });

  test("it fails when extension doesn't match", (done) => {
    const callback = (_err, result) => {
      const twiml = result.toString();
      expect(typeof twiml).toBe('string');
      expect(twiml).toContain('<Say>Extension 404 is not found');
      expect(twiml).toContain('Redirect>./extension-menu');
      done();
    };
    twimlAppFunction(baseContext, { Digits: '404' }, callback);
  });
});
