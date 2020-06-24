const fn = require('../functions/personal-voicemail');
const helpers = require('../../test/test-helper');
const testHelper = require('../../test/test-helper');

const TEST_DOMAIN = 'wookiees-are-the-best.com';
const FN_URL = 'https://' + TEST_DOMAIN + '/personal-voicemail';

// poor man's deep copy
const deepCopy = (input) => JSON.parse(JSON.stringify(input));

// we can't reset the base fn.options parameter, 
// but we can replace its contents
const resetOptions = () => {
  for (k in origOptions) {
    if (origOptions.hasOwnProperty(k)) {
      fn.options[k] = deepCopy(origOptions[k]);
    }
  }
};

let event = {};
const origOptions = deepCopy(fn.options);
const origEvent = {
  'From': '+12223334444',
  'To': '+13334445555',
  'CallSid': 'CA00000000000000000000000000000000',
  'CallStatus': undefined,
  'DialCallStatus': undefined,
  'RecordingUrl': undefined,
  'CallerId': undefined
};

const dummyPhoneNumber = '+15556667777';
const dummyMsgSid = "MS00000000000000000000000000000000";

const mockTwilioClient = {
  messages: {
    create: jest.fn(() =>
      Promise.resolve({
        sid: dummyMsgSid
      })
    )
  }
};

const context = {
  DOMAIN_NAME: TEST_DOMAIN,
  ACCOUNT_SID: "AC00000000000000000000000000000000",
  AUTH_TOKEN: "no-a-real-token",
  getTwilioClient: () => mockTwilioClient
}

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

beforeEach(() => {
  jest.clearAllMocks();
  fn.options.phoneNumber = '+15556667777';
  event = deepCopy(origEvent);
});

const assertTwiml = (response, expectedVerb) => {
  expect(response.toString()).toBe("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response>" + expectedVerb + "</Response>");
};

describe('Test Inbound Handler', () => {
  beforeEach(() => {
    event['CallStatus'] = 'ringing';
  });

  afterEach(() => {
    resetOptions();
  });

  it('Forwards the call when all is well', (done) => {
    const expectedVerb = '<Dial action=\"' + FN_URL + '?handle-voicemail\" timeout=\"12\">' + dummyPhoneNumber + '</Dial>';
    const callback = (err, result) => {
      assertTwiml(result, expectedVerb);
      done();
    };
    
    fn.handler(context, event, callback);
  });

  it('Forwards the call with event-supplied CallerId and Timeout', (done) => {
    event['CallerId'] = '+19998887777';
    fn.options.defaultTimeout = 2;

    const expectedVerb = '<Dial action=\"' + FN_URL + '?handle-voicemail\" callerId=\"+19998887777\" timeout=\"2\">' + dummyPhoneNumber + '</Dial>';
    const callback = (err, result) => {
      assertTwiml(result, expectedVerb);
      done();
    };
    
    fn.handler(context, event, callback);
  });
});

describe('Test reject list', () => {
  beforeEach(() => {
    event['CallStatus'] = 'ringing';
  });

  afterEach(() => {
    resetOptions();
  });
  
  it('Does reject on match', (done) => {
    fn.options.reject.push('+12223334444');

    const expectedVerb = '<Say voice=\"alice\" language=\"en-US\">You are calling from a restricted number. Goodbye.</Say><Hangup/>';
    const callback = (err, result) => {
      assertTwiml(result, expectedVerb);
      done();
    };
    
    fn.handler(context, event, callback);  
  });

  it('Rejects with custom message, voice & language', (done) => {
    fn.options.reject.push('+12223334444');
    fn.options.rejectMessage = 'Shoo!';
    fn.options.voiceOpts['voice'] = 'bob';
    fn.options.voiceOpts['language'] = 'en-GB';

    const expectedVerb = '<Say voice=\"bob\" language=\"en-GB\">Shoo!</Say><Hangup/>';
    const callback = (err, result) => {
      assertTwiml(result, expectedVerb);
      done();
    };

    fn.handler(context, event, callback);
  });

  it('Rejects with no message if voiceMessage is false', (done) => {
    fn.options.reject.push('+12223334444');
    fn.options.rejectMessage = false;

    const expectedVerb = '<Hangup/>';
    const callback = (err, result) => {
      assertTwiml(result, expectedVerb);
      done();
    };
    
    fn.handler(context, event, callback); 
  });

  it('Does not reject when reject list populated, but no match', (done) => {
    fn.options.reject.push('+10000000000');

    const expectedVerb = '<Dial action=\"' + FN_URL + '?handle-voicemail\" timeout=\"12\">' + dummyPhoneNumber + '</Dial>';
    const callback = (err, result) => {
      assertTwiml(result, expectedVerb);
      done();
    };
    
    fn.handler(context, event, callback);
  });
});

describe('Test queued state handler', () => {
  beforeEach(() => {
    event['CallStatus'] = 'queued';
  });

  it('Redirects when status is queued', (done) => {
    const expectedVerb = '<Redirect>' + FN_URL + '</Redirect>';
    const callback = (err, result) => {
      assertTwiml(result, expectedVerb);
      done();
    };

    fn.handler(context, event, callback);
  });
});

describe('Test voicemail handler', () => {
  beforeEach(() => {
    event['CallStatus'] = 'in-progress';
    event['DialCallStatus'] = 'no-answer';
  });

  it('Sends no-answer to Voicemail', () => {
    const expectedSay = '<Say voice=\"alice\" language=\"en-US\">Hello, I can not answer the phone right now. Please leave a message. Hang up when you\'re finished.</Say>';
    const expectedRecord = '<Record action=\"https://wookiees-are-the-best.com/personal-voicemail?notify-voicemail\" timeout=\"10\"/>';
    const callback = (err, result) => {
      assertTwiml(result, expectedSay + expectedRecord);

    };

    fn.handler(context, event, callback);
  });

  it('Sends no-answer to Voicemail with custom message', () => {
    fn.options.voiceMailMessage = "Dave's not here, man.";
    const expectedSay = '<Say voice=\"alice\" language=\"en-US\">Dave\'s not here, man.</Say>';
    const expectedRecord = '<Record action=\"https://wookiees-are-the-best.com/personal-voicemail?notify-voicemail\" timeout=\"10\"/>';
    const callback = (err, result) => {
      assertTwiml(result, expectedSay + expectedRecord);
    };

    fn.handler(context, event, callback);    
  });

  it('Sends no-answer to Voicemail with recorded message', () => {
    fn.options.voiceMailMessage = "https://a.com/b.mp3";
    const expectedPlay = '<Play>https://a.com/b.mp3</Play>';
    const expectedRecord = '<Record action=\"https://wookiees-are-the-best.com/personal-voicemail?notify-voicemail\" timeout=\"10\"/>';
    const callback = (err, result) => {
      assertTwiml(result, expectedPlay + expectedRecord);
    };

    fn.handler(context, event, callback);    
  });
});

describe('Test voicemail notifier', () => {
  beforeEach(() => {
    event['CallStatus'] = 'completed';
    event['Digits'] = 'hangup';
    event['RecordingUrl'] = 'https://a.com/b';
  });

  it('Sends notification SMS with recording media url', () => {
    fn.options['secureRecordingLinks'] = false;

    const callback = (err, result) => {
      expect(result).toBe(dummyMsgSid);
      expect(mockTwilioClient.messages.create.mock.calls.length).toBe(1);

      const expectedCreateCall = {
        "body": "New voicemail from +12223334444", 
        "from": "+13334445555", 
        "mediaUrl": "https://a.com/b.mp3", 
        "to": '+15556667777'
      };
      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith(expectedCreateCall);
    }

    fn.handler(context, event, callback);
  });

  it('Sends notification SMS with embedded link', () => {
    fn.options['secureRecordingLinks'] = true;
    
    const callback = (err, result) => {
      expect(result).toBe(dummyMsgSid);
      expect(mockTwilioClient.messages.create.mock.calls.length).toBe(1);

      const expectedCreateCall = {
        "body": "New voicemail from +12223334444 - https://www.twilio.com/console/voice/logs/calls/CA00000000000000000000000000000000", 
        "from": "+13334445555", 
        "to": '+15556667777'
      };
      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith(expectedCreateCall);
    }

    fn.handler(context, event, callback);
  });
});

describe('When all else fails, hangup', () => {
  it('Hangs up when it does not know what else to do', () => {
    event = {};
    const callback = (err, result) => {
      const expectedVerb = '<Hangup/>';
      assertTwiml(result, expectedVerb);
    }

    fn.handler(context, event, callback);
  });
});
