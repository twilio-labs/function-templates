const funlet = require('../functions/funlet-forward.protected');
const runtime = require('../../test/test-helper');
const Twilio = require('twilio');

const PHONE_NUMBER = '415-555-1212';
const DEFAULT_PHONE_NUMBER = '';

const ALLOWED_CALLER1 = '415-555-1001';
const ALLOWED_CALLER2 = '415-555-1002';
const ALLOWED_CALLER3 = '415-555-1003';
const ALLOWED_CALLER4 = '415-555-1004';
const ALLOWED_CALLER5 = '415-555-1005';
const ALLOWED_CALLER1_DIGITS = '4155551001';
const ALLOWED_CALLER2_DIGITS = '4155551002';
const ALLOWED_CALLER3_DIGITS = '4155551003';
const ALLOWED_CALLER4_DIGITS = '4155551004';
const ALLOWED_CALLER5_DIGITS = '4155551005';

const ALL_NUMBERS_ALLOWED = [];
const DEFAULT_ALLOWED_CALLERS = ALL_NUMBERS_ALLOWED;

const FULL_US_NUMBER = "+1-510-555-1212'";
const LOCAL_US_NUMBER_DIGITS = '5105551212';

const CALLER_NUMBER = '510-555-1212';
const CALLER_NUMBER_DIGITS = '5105551212';
const CALLED_NUMBER = '650-555-1212';
const CALLED_NUMBER_DIGITS = '650-555-1212';

const CALLER_ID = ALLOWED_CALLER2;
const NO_CALLER_ID = '';
const DEFAULT_CALLER_ID = NO_CALLER_ID;

const FALLBACK_URL = 'https://example.com/please-try-later.mp3';
const FALLBACK_URL_ENCODED = 'https%3A%2F%2Fexample.com%2Fplease-try-later.mp3';
const NO_FALLBACK_URL = '';
const DEFAULT_FALLBACK_URL = NO_FALLBACK_URL;

const BASE_ACTION_URL = '.?Dial=true';
const ACTION_URL_WITH_FALLBACK_URL = `${BASE_ACTION_URL}&${FALLBACK_URL_ENCODED}`;
const XML_ACTION_URL_WITH_FALLBACK_URL = `${BASE_ACTION_URL}&amp;${FALLBACK_URL_ENCODED}`;

const TIMEOUT_STRING = '42';
const TIMEOUT = 42;
const DEFAULT_TIMEOUT = 20;

const ACCESS_RESTRICTED = 'Custom Access Restricted Error Message';
const DEFAULT_ACCESS_RESTRICTED =
  'Sorry, you are calling from a restricted number. Good bye.';

const ENGLISH = 'en';
const FRENCH = 'fr';
const DEFAULT_LANGUAGE = ENGLISH;

const MAN = 'man';
const WOMAN = 'woman';
const ALICE = 'alice';
const DEFAULT_VOICE = ALICE;

const DIAL_DONE = true;
const DIAL_NOT_DONE = false;

const NO_CALL_STATUS = '';
const CALL_ANSWERED = 'answered';
const CALL_COMPLETED = 'completed';
const CALL_BUSY = 'busy';

const IS_ALLOWED_CALLER = true;
const IS_RESTRICTED_NUMBER = false;

const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';

const FULL_RESPONSE_FORWARD_1_1 = `${XML_DECLARATION}<Response>\
<Dial action="${BASE_ACTION_URL}" timeout="${DEFAULT_TIMEOUT}">${PHONE_NUMBER}</Dial>\
</Response>`;

const FULL_RESPONSE_FORWARD_1_2 = `${XML_DECLARATION}<Response>\
<Dial action="${XML_ACTION_URL_WITH_FALLBACK_URL}" timeout="${DEFAULT_TIMEOUT}">\
${PHONE_NUMBER}\
</Dial>\
</Response>`;

const FULL_RESPONSE_FORWARD_1_4 = `${XML_DECLARATION}<Response>\
<Say language="${FRENCH}" voice="${MAN}">${ACCESS_RESTRICTED}</Say>\
</Response>`;

const FULL_RESPONSE_FORWARD_1_7 = `${XML_DECLARATION}<Response>\
<Dial action="${BASE_ACTION_URL}" callerId="${CALLER_ID}" timeout="${TIMEOUT}">\
${PHONE_NUMBER}\
</Dial>\
</Response>`;

const HANG_UP = `${XML_DECLARATION}<Response><Hangup/></Response>`;

const FULL_RESPONSE_FORWARD_2_4 = `${XML_DECLARATION}<Response>\
<Redirect>${FALLBACK_URL}</Redirect>\
</Response>`;

beforeAll(() => runtime.setup());

test('[FORWARD-INPUT-PHONE-NUMBER-1] Read Phone Number from Event', () => {
  expect(
    funlet.input.getPhoneNumber({ PhoneNumber: PHONE_NUMBER }, {}, {})
  ).toEqual(PHONE_NUMBER);
});

test('[FORWARD-INPUT-PHONE-NUMBER-2] Read Phone Number from Environment', () => {
  expect(
    funlet.input.getPhoneNumber(
      {},
      { FUNLET_FORWARD_PHONE_NUMBER: PHONE_NUMBER },
      {}
    )
  ).toEqual(PHONE_NUMBER);
});

test('[FORWARD-INPUT-PHONE-NUMBER-3] Read Phone Number from Script Config', () => {
  expect(
    funlet.input.getPhoneNumber({}, {}, { phoneNumber: PHONE_NUMBER })
  ).toEqual(PHONE_NUMBER);
});

test(
  '[FORWARD-INPUT-PHONE-NUMBER-4] ' +
    'Read Default Phone Number from Script Config',
  () => {
    expect(funlet.config.phoneNumber).toEqual(DEFAULT_PHONE_NUMBER);
  }
);

test('[FORWARD-INPUT-CALLER-ID-1] Read Caller Id from Event', () => {
  expect(funlet.input.getCallerId({ CallerId: CALLER_ID }, {}, {})).toEqual(
    CALLER_ID
  );
});

test('[FORWARD-INPUT-CALLER-ID-2] Read Caller Id from Environment', () => {
  expect(
    funlet.input.getCallerId({}, { FUNLET_FORWARD_CALLER_ID: CALLER_ID }, {})
  ).toEqual(CALLER_ID);
});

test('[FORWARD-INPUT-CALLER-ID-3] Read Caller Id from Script Config', () => {
  expect(funlet.input.getCallerId({}, {}, { callerId: CALLER_ID })).toEqual(
    CALLER_ID
  );
});

test('[FORWARD-INPUT-CALLER-ID-4] Read Default Caller Id from Script Config', () => {
  expect(funlet.config.callerId).toEqual(DEFAULT_CALLER_ID);
});

test('[FORWARD-INPUT-FALLBACK-URL-1] Read Fallback URL from Event', () => {
  expect(
    funlet.input.getFallbackUrl({ FailUrl: FALLBACK_URL }, {}, {})
  ).toEqual(FALLBACK_URL);
});

test('[FORWARD-INPUT-FALLBACK-URL-2] Read Fallback URL from Environment', () => {
  expect(
    funlet.input.getFallbackUrl(
      {},
      { FUNLET_FORWARD_FALLBACK_URL: FALLBACK_URL },
      {}
    )
  ).toEqual(FALLBACK_URL);
});

test('[FORWARD-INPUT-FALLBACK-URL-3] Read Fallback URL from Script Config', () => {
  expect(
    funlet.input.getFallbackUrl({}, {}, { fallbackUrl: FALLBACK_URL })
  ).toEqual(FALLBACK_URL);
});

test(
  '[FORWARD-INPUT-FALLBACK-URL-4] ' +
    'Read Default Fallback URL from Script Config',
  () => {
    expect(funlet.config.fallbackUrl).toEqual(DEFAULT_FALLBACK_URL);
  }
);

test('[FORWARD-INPUT-TIMEOUT-1] Read Timeout from Event', () => {
  expect(funlet.input.getTimeout({ Timeout: TIMEOUT_STRING }, {}, {})).toEqual(
    TIMEOUT
  );
});

test('[FORWARD-INPUT-TIMEOUT-2] Read Timeout from Environment', () => {
  expect(
    funlet.input.getTimeout({}, { FUNLET_FORWARD_TIMEOUT: TIMEOUT_STRING }, {})
  ).toEqual(TIMEOUT);
});

test('[FORWARD-INPUT-TIMEOUT-3] Read Timeout from Script Config', () => {
  expect(funlet.input.getTimeout({}, {}, { timeout: TIMEOUT })).toEqual(
    TIMEOUT
  );
});

test('[FORWARD-INPUT-TIMEOUT-4] Read Default Timeout from Script Config', () => {
  expect(funlet.config.timeout).toEqual(DEFAULT_TIMEOUT);
});

test('[FORWARD-INPUT-ALLOWED-CALLERS-1] Read Single Allowed Caller from Event', () => {
  expect(
    funlet.input.getAllowedCallers({ AllowedCallers: ALLOWED_CALLER1 }, {}, {})
  ).toEqual([ALLOWED_CALLER1_DIGITS]);
});

test(
  '[FORWARD-INPUT-ALLOWED-CALLERS-2] ' +
    'Read List of Allowed Callers from Event',
  () => {
    expect(
      funlet.input.getAllowedCallers(
        {
          AllowedCallers: [ALLOWED_CALLER1, ALLOWED_CALLER2, ALLOWED_CALLER3],
        },
        {},
        {}
      )
    ).toEqual([
      ALLOWED_CALLER1_DIGITS,
      ALLOWED_CALLER2_DIGITS,
      ALLOWED_CALLER3_DIGITS,
    ]);
  }
);

test(
  '[FORWARD-INPUT-ALLOWED-CALLERS-3] ' +
    'Read Indexed List of Allowed Callers from Event',
  () => {
    expect(
      funlet.input.getAllowedCallers(
        {
          'AllowedCallers[0]': ALLOWED_CALLER1,
          'AllowedCallers[1]': ALLOWED_CALLER2,
          'AllowedCallers[2]': ALLOWED_CALLER3,
        },
        {},
        {}
      )
    ).toEqual([
      ALLOWED_CALLER1_DIGITS,
      ALLOWED_CALLER2_DIGITS,
      ALLOWED_CALLER3_DIGITS,
    ]);
  }
);

test(
  '[FORWARD-INPUT-ALLOWED-CALLERS-4] ' +
    'Read Single Allowed Caller from Environment',
  () => {
    expect(
      funlet.input.getAllowedCallers(
        {},
        {
          FUNLET_FORWARD_ALLOWED_CALLER1: ALLOWED_CALLER1,
        },
        {}
      )
    ).toEqual([ALLOWED_CALLER1_DIGITS]);
  }
);

test(
  '[FORWARD-INPUT-ALLOWED-CALLERS-5] ' +
    'Read Five Allowed Callers from Environment',
  () => {
    expect(
      funlet.input.getAllowedCallers(
        {},
        {
          FUNLET_FORWARD_ALLOWED_CALLER1: ALLOWED_CALLER1,
          FUNLET_FORWARD_ALLOWED_CALLER2: ALLOWED_CALLER2,
          FUNLET_FORWARD_ALLOWED_CALLER3: ALLOWED_CALLER3,
          FUNLET_FORWARD_ALLOWED_CALLER4: ALLOWED_CALLER4,
          FUNLET_FORWARD_ALLOWED_CALLER5: ALLOWED_CALLER5,
        },
        {}
      )
    ).toEqual([
      ALLOWED_CALLER1_DIGITS,
      ALLOWED_CALLER2_DIGITS,
      ALLOWED_CALLER3_DIGITS,
      ALLOWED_CALLER4_DIGITS,
      ALLOWED_CALLER5_DIGITS,
    ]);
  }
);

test(
  '[FORWARD-INPUT-ALLOWED-CALLERS-6] ' +
    'Read Allowed Callers from Script Config',
  () => {
    expect(
      funlet.input.getAllowedCallers(
        {},
        {},
        { allowedCallers: [ALLOWED_CALLER1, ALLOWED_CALLER2, ALLOWED_CALLER3] }
      )
    ).toEqual([
      ALLOWED_CALLER1_DIGITS,
      ALLOWED_CALLER2_DIGITS,
      ALLOWED_CALLER3_DIGITS,
    ]);
  }
);

test(
  '[FORWARD-INPUT-ALLOWED-CALLERS-7] ' +
    'Read Default Allowed Callers from Script Config',
  () => {
    expect(funlet.config.allowedCallers).toEqual(DEFAULT_ALLOWED_CALLERS);
  }
);

test('[FORWARD-INPUT-ALLOWED-CALLERS-8] Skip empty values', () => {
  expect(
    funlet.input.getAllowedCallers(
      {},
      {
        FUNLET_FORWARD_ALLOWED_CALLER1: ALLOWED_CALLER1,
        FUNLET_FORWARD_ALLOWED_CALLER2: '',
        FUNLET_FORWARD_ALLOWED_CALLER3: ALLOWED_CALLER3,
        FUNLET_FORWARD_ALLOWED_CALLER4: '',
        FUNLET_FORWARD_ALLOWED_CALLER5: ALLOWED_CALLER5,
      },
      {}
    )
  ).toEqual([
    ALLOWED_CALLER1_DIGITS,
    ALLOWED_CALLER3_DIGITS,
    ALLOWED_CALLER5_DIGITS,
  ]);
});

test('[FORWARD-INPUT-ALLOWED-CALLERS-9] Use local US number in API 2008-08-01', () => {
  expect(
    funlet.input.getAllowedCallers(
      {
        ApiVersion: '2008-08-01',
        AllowedCallers: FULL_US_NUMBER,
      },
      {},
      {}
    )
  ).toEqual([LOCAL_US_NUMBER_DIGITS]);
});

test(
  '[FORWARD-INPUT-ACCESS-RESTRICTED-1] ' +
    'Read Access Restricted Error Message from Event',
  () => {
    expect(
      funlet.input.getAccessRestrictedErrorMessage(
        {
          AccessRestricted: ACCESS_RESTRICTED,
        },
        {},
        {}
      )
    ).toEqual(ACCESS_RESTRICTED);
  }
);

test(
  '[FORWARD-INPUT-ACCESS-RESTRICTED-2] ' +
    'Read Access Restricted Error Message from Environment',
  () => {
    expect(
      funlet.input.getAccessRestrictedErrorMessage(
        {},
        {
          FUNLET_FORWARD_ACCESS_RESTRICTED: ACCESS_RESTRICTED,
        },
        {}
      )
    ).toEqual(ACCESS_RESTRICTED);
  }
);

test(
  '[FORWARD-INPUT-ACCESS-RESTRICTED-3] ' +
    'Read Access Restricted Error Message from Script Config',
  () => {
    expect(
      funlet.input.getAccessRestrictedErrorMessage(
        {},
        {},
        {
          accessRestricted: ACCESS_RESTRICTED,
        }
      )
    ).toEqual(ACCESS_RESTRICTED);
  }
);

test(
  '[FORWARD-INPUT-ACCESS-RESTRICTED-4] ' +
    'Read Default Access Restricted Error Message from Script Config',
  () => {
    expect(funlet.config.accessRestricted).toEqual(DEFAULT_ACCESS_RESTRICTED);
  }
);

test('[FORWARD-INPUT-LANGUAGE-1] Read Language from Event', () => {
  expect(funlet.input.getLanguage({ Language: FRENCH }, {}, {})).toEqual(
    FRENCH
  );
});

test('[FORWARD-INPUT-LANGUAGE-2] Read Language from Environment', () => {
  expect(
    funlet.input.getLanguage({}, { FUNLET_FORWARD_LANGUAGE: FRENCH }, {})
  ).toEqual(FRENCH);
});

test('[FORWARD-INPUT-LANGUAGE-3] Read Language from Script Config', () => {
  expect(funlet.input.getLanguage({}, {}, { language: FRENCH })).toEqual(
    FRENCH
  );
});

test('[FORWARD-INPUT-LANGUAGE-4] Read Default Language from Script Config', () => {
  expect(funlet.config.language).toEqual(DEFAULT_LANGUAGE);
});

test('[FORWARD-INPUT-VOICE-1] Read Voice from Event', () => {
  expect(funlet.input.getVoice({ Voice: MAN }, {}, {})).toEqual(MAN);
});

test('[FORWARD-INPUT-VOICE-2] Read Voice from Environment', () => {
  expect(
    funlet.input.getVoice({}, { FUNLET_FORWARD_VOICE: WOMAN }, {})
  ).toEqual(WOMAN);
});

test('[FORWARD-INPUT-VOICE-3] Read Voice from Script Config', () => {
  expect(funlet.input.getVoice({}, {}, { voice: WOMAN })).toEqual(WOMAN);
});

test('[FORWARD-INPUT-VOICE-4] Read Default Voice from Script Config', () => {
  expect(funlet.config.voice).toEqual(DEFAULT_VOICE);
});

test('[FORWARD-INPUT-CALLER-1] Read Caller from Event, in From Parameter', () => {
  expect(funlet.input.getCaller({ From: CALLER_NUMBER }, {}, {})).toEqual(
    CALLER_NUMBER
  );
});

test('[FORWARD-INPUT-CALLER-2] Read Caller from Event, in Caller Parameter', () => {
  expect(funlet.input.getCaller({ Caller: CALLER_NUMBER }, {}, {})).toEqual(
    CALLER_NUMBER
  );
});

test(
  '[FORWARD-INPUT-PHONE-NUMBER-CALLED-1] ' +
    'Read Phone Number Called from Event, in To Parameter',
  () => {
    expect(
      funlet.input.getPhoneNumberCalled({ To: CALLED_NUMBER }, {}, {})
    ).toEqual(CALLED_NUMBER);
  }
);

test(
  '[FORWARD-INPUT-PHONE-NUMBER-CALLED-2] ' +
    'Read Phone Number Called from Event, in Called Parameter',
  () => {
    expect(
      funlet.input.getPhoneNumberCalled({ Called: CALLED_NUMBER }, {}, {})
    ).toEqual(CALLED_NUMBER);
  }
);

test('[FORWARD-INPUT-DIAL-0] Read No Dial from Event', () => {
  expect(funlet.input.isDialDone({}, {}, {})).toEqual(DIAL_NOT_DONE);
});

test('[FORWARD-INPUT-DIAL-1] Read Dial from Event', () => {
  expect(funlet.input.isDialDone({ Dial: 'true' }, {}, {})).toEqual(DIAL_DONE);
});

test('[FORWARD-INPUT-CALL-STATUS-0] Read No Call Status from Event', () => {
  expect(funlet.input.getCallStatus({}, {}, {})).toEqual(NO_CALL_STATUS);
});

test('[FORWARD-INPUT-CALL-STATUS-1] Read Answered Call Status from Event', () => {
  expect(
    funlet.input.getCallStatus({ DialStatus: CALL_ANSWERED }, {}, {})
  ).toEqual(CALL_ANSWERED);
});

test('[FORWARD-INPUT-CALL-STATUS-2] Read Completed Call Status from Event', () => {
  expect(
    funlet.input.getCallStatus({ DialCallStatus: CALL_COMPLETED }, {}, {})
  ).toEqual(CALL_COMPLETED);
});

test('[FORWARD-INPUT-CALL-STATUS-3] Read Busy Call Status from Event', () => {
  expect(
    funlet.input.getCallStatus({ DialCallStatus: CALL_BUSY }, {}, {})
  ).toEqual(CALL_BUSY);
});

test('[FORWARD-UTILS-IS-FORWARDING-ALLOWED-1] All Numbers Allowed', () => {
  expect(
    funlet.utils.isForwardingAllowed(
      CALLER_NUMBER_DIGITS,
      CALLED_NUMBER_DIGITS,
      ALL_NUMBERS_ALLOWED
    )
  ).toEqual(true);
});

test('[FORWARD-UTILS-IS-FORWARDING-ALLOWED-2] Restricted Number', () => {
  expect(
    funlet.utils.isForwardingAllowed(
      CALLER_NUMBER_DIGITS,
      CALLED_NUMBER_DIGITS,
      [ALLOWED_CALLER1_DIGITS, ALLOWED_CALLER2_DIGITS, ALLOWED_CALLER3_DIGITS]
    )
  ).toEqual(false);
});

test('[FORWARD-UTILS-IS-FORWARDING-ALLOWED-3] Allowed Caller', () => {
  expect(
    funlet.utils.isForwardingAllowed(
      ALLOWED_CALLER3_DIGITS,
      CALLED_NUMBER_DIGITS,
      [ALLOWED_CALLER1_DIGITS, ALLOWED_CALLER2_DIGITS, ALLOWED_CALLER3_DIGITS]
    )
  ).toEqual(true);
});

test('[FORWARD-UTILS-IS-FORWARDING-ALLOWED-4] Allowed Called Number', () => {
  expect(
    funlet.utils.isForwardingAllowed(
      CALLER_NUMBER_DIGITS,
      ALLOWED_CALLER1_DIGITS,
      [ALLOWED_CALLER1_DIGITS, ALLOWED_CALLER2_DIGITS, ALLOWED_CALLER3_DIGITS]
    )
  ).toEqual(true);
});

test('[FORWARD-OUTPUT-FORWARD-ACTION-URL-0] Action URL without Fallback URL', () => {
  const actionUrl = funlet.output.getForwardActionUrl(NO_FALLBACK_URL);
  expect(actionUrl).toEqual(BASE_ACTION_URL);
});

test('[FORWARD-OUTPUT-FORWARD-ACTION-URL-1] Action URL with Fallback URL', () => {
  const actionUrl = funlet.output.getForwardActionUrl(FALLBACK_URL);
  expect(actionUrl).toEqual(ACTION_URL_WITH_FALLBACK_URL);
});

test('[FORWARD-OUTPUT-FORWARD-1-1] Forward without Fallback URL', () => {
  const response = new Twilio.twiml.VoiceResponse();
  funlet.output.forwardStage1(
    response,
    IS_ALLOWED_CALLER,
    DEFAULT_ACCESS_RESTRICTED,
    ENGLISH,
    ALICE,
    DEFAULT_CALLER_ID,
    PHONE_NUMBER,
    DEFAULT_TIMEOUT,
    NO_FALLBACK_URL
  );
  expect(response.toString()).toEqual(FULL_RESPONSE_FORWARD_1_1);
});

test('[FORWARD-OUTPUT-FORWARD-1-2] Forward with Fallback URL', () => {
  const response = new Twilio.twiml.VoiceResponse();
  funlet.output.forwardStage1(
    response,
    IS_ALLOWED_CALLER,
    DEFAULT_ACCESS_RESTRICTED,
    ENGLISH,
    ALICE,
    DEFAULT_CALLER_ID,
    PHONE_NUMBER,
    DEFAULT_TIMEOUT,
    FALLBACK_URL
  );
  expect(response.toString()).toEqual(FULL_RESPONSE_FORWARD_1_2);
});

test('[FORWARD-OUTPUT-FORWARD-1-4] Restricted Number', () => {
  const response = new Twilio.twiml.VoiceResponse();
  funlet.output.forwardStage1(
    response,
    IS_RESTRICTED_NUMBER,
    ACCESS_RESTRICTED,
    FRENCH,
    MAN,
    DEFAULT_CALLER_ID,
    PHONE_NUMBER,
    DEFAULT_TIMEOUT,
    NO_FALLBACK_URL
  );
  expect(response.toString()).toEqual(FULL_RESPONSE_FORWARD_1_4);
});

test('[FORWARD-OUTPUT-FORWARD-1-7] Custom Timeout and Caller Id', () => {
  const response = new Twilio.twiml.VoiceResponse();
  funlet.output.forwardStage1(
    response,
    IS_ALLOWED_CALLER,
    DEFAULT_ACCESS_RESTRICTED,
    ENGLISH,
    ALICE,
    CALLER_ID,
    PHONE_NUMBER,
    TIMEOUT,
    NO_FALLBACK_URL
  );
  expect(response.toString()).toEqual(FULL_RESPONSE_FORWARD_1_7);
});

test('[FORWARD-OUTPUT-FORWARD-2-0] Call Ongoing', () => {
  const EMPTY_RESPONSE = `${XML_DECLARATION}<Response/>`;

  const response = new Twilio.twiml.VoiceResponse();
  const isFinished = funlet.output.forwardStage2(
    response,
    DIAL_NOT_DONE,
    NO_CALL_STATUS,
    NO_FALLBACK_URL
  );
  expect(isFinished).toEqual(DIAL_NOT_DONE);
  expect(response.toString()).toEqual(EMPTY_RESPONSE);
});

test('[FORWARD-OUTPUT-FORWARD-2-1] Call Completed', () => {
  const response = new Twilio.twiml.VoiceResponse();
  const isFinished = funlet.output.forwardStage2(
    response,
    DIAL_DONE,
    CALL_COMPLETED,
    NO_FALLBACK_URL
  );
  expect(isFinished).toEqual(DIAL_DONE);
  expect(response.toString()).toEqual(HANG_UP);
});

test('[FORWARD-OUTPUT-FORWARD-2-2] Call Answered', () => {
  const response = new Twilio.twiml.VoiceResponse();
  const isFinished = funlet.output.forwardStage2(
    response,
    DIAL_DONE,
    CALL_ANSWERED,
    NO_FALLBACK_URL
  );
  expect(isFinished).toEqual(DIAL_DONE);
  expect(response.toString()).toEqual(HANG_UP);
});

test('[FORWARD-OUTPUT-FORWARD-2-3] Failure with No Fallback URL', () => {
  const response = new Twilio.twiml.VoiceResponse();
  const isFinished = funlet.output.forwardStage2(
    response,
    DIAL_DONE,
    CALL_BUSY,
    NO_FALLBACK_URL
  );
  expect(isFinished).toEqual(DIAL_DONE);
  expect(response.toString()).toEqual(HANG_UP);
});

test('[FORWARD-OUTPUT-FORWARD-2-4] Failure with Fallback URL', () => {
  const response = new Twilio.twiml.VoiceResponse();
  const isFinished = funlet.output.forwardStage2(
    response,
    DIAL_DONE,
    CALL_BUSY,
    FALLBACK_URL
  );
  expect(isFinished).toEqual(DIAL_DONE);
  expect(response.toString()).toEqual(FULL_RESPONSE_FORWARD_2_4);
});

test('[FORWARD-1-2] Successful Forward + Fallback URL (from Example 2)', (done) => {
  const callback = (_err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
    expect(result.toString()).toEqual(FULL_RESPONSE_FORWARD_1_2);
    done();
  };
  funlet.handler(
    {},
    {
      PhoneNumber: PHONE_NUMBER,
      FailUrl: FALLBACK_URL,
    },
    callback
  );
});

test('[FORWARD-2-4] Failure with Fallback URL', (done) => {
  const callback = (_err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
    expect(result.toString()).toEqual(FULL_RESPONSE_FORWARD_2_4);
    done();
  };
  funlet.handler(
    {},
    {
      Dial: 'true',
      DialCallStatus: 'busy',
      FailUrl: FALLBACK_URL,
    },
    callback
  );
});

afterAll(() => runtime.teardown());
