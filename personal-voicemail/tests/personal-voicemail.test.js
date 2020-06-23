const { getExpectedBodyHash } = require('twilio/lib/webhooks/webhooks');

const fn = require('../functions/personal-voicemail');
const helpers = require('../../test/test-helper');
const { utc } = require('moment');

const TEST_DOMAIN = 'wookiees-are-the-best.com';
const FN_URL = 'https://' + TEST_DOMAIN + '/personal-voicemail';

let event = {
  'From': '+12223334444',
  'CallStatus': ''
}

let context = {
  DOMAIN_NAME: "wookiees-are-the-best.com"
}

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  event['CallStatus'] = '';
  fn.reject.length = 0;
  helpers.teardown();
});

describe('Test Inbound Handler', () => {
  
  const origRejectMessage = fn.rejectMessage;
  const origVoiceOpts = fn.voiceOpts;

  beforeAll(() => {
    event['CallStatus'] = 'ringing';
  });

  afterEach(() => {
    fn.reject.length = 0
    fn.rejectMessage = origRejectMessage;
    fn.voiceOpts = origVoiceOpts;
  });


  it('Does not reject on empty reject list (callback)', (done) => {
    const expectedVerb = '<Dial action=\"' + FN_URL + '?handle-voicemail\" timeout=\"12\">+17203089773</Dial>';
    const callback = (err, result) => {
      expect(result.toString()).toContain(expectedVerb);
      done();
    };
    
    fn.handler(context, event, callback);
  });

  it('Does not reject when no match', (done) => {
    fn.reject.push('+10000000000');

    const expectedVerb = '<Dial action=\"' + FN_URL + '?handle-voicemail\" timeout=\"12\">+17203089773</Dial>';
    const callback = (err, result) => {
      expect(result.toString()).toContain(expectedVerb);
      done();
    };
    
    fn.handler(context, event, callback);
  });

  it('Does reject on match', (done) => {
    fn.reject.push('+12223334444');

    const expectedVerb = '<Say voice=\"alice\" language=\"en-US\">You are calling from a restricted number. Goodbye.</Say><Hangup/>';
    const callback = (err, result) => {
      expect(result.toString()).toContain(expectedVerb);
      done();
    };
    
    fn.handler(context, event, callback);  
  });

  it('Rejects with custom message, voice & language', (done) => {
    fn.input.reject.push('+12223334444');
    fn.input.rejectMessage = 'Shoo!';
    fn.input.voiceOpts['voice'] = 'bob';
    fn.input.voiceOpts['language'] = 'en-GB';

    const expectedVerb = '<Say voice=\"bob\" language=\"en-GB\">Shoo!</Say>';
    const callback = (err, result) => {
      expect(result.toString()).toContain(expectedVerb);
      done();
    }

    fn.handler(context, event, callback);
  });
});

describe('Test queued state handler', () => {
  beforeAll(() => {
    event['CallStatus'] = 'queued';
  });

  it('Redirects when status is queued', (done) => {
    const expectedVerb = '<Redirect>' + FN_URL + '</Redirect>';
    const callback = (err, result) => {
      expect(result.toString()).toContain(expectedVerb);
      done();
    }

    fn.handler(context, event, callback);
  });
});

