const funlet = require('../functions/funlet-whisper.protected');
const runtime = require('../../test/test-helper');
const Twilio = require('twilio');

const FROM_NUMBER = '+19165550123';
const SPELLED_FROM_NUMBER = '+. 1. 9. 1. 6. 5. 5. 5. 0. 1. 2. 3. ';

const RECORDED_MESSAGE = 'https://example.com/recorded-message.mp3';
const TEXT_MESSAGE = 'Text message';
const MESSAGE = TEXT_MESSAGE;
const DEFAULT_MESSAGE =
  `You are receiving a call from ${SPELLED_FROM_NUMBER}. ` +
  `Press any key to accept.`;

const ENGLISH = 'en';
const FRENCH = 'fr';
const DEFAULT_LANGUAGE = ENGLISH;

const MAN = 'man';
const WOMAN = 'woman';
const ALICE = 'alice';
const DEFAULT_VOICE = ALICE;

const DEFAULT_HUMAN_CHECK = false;

const NO_DIGITS = null;
const EMPTY_DIGITS = '';
const NON_EMPTY_DIGITS = '5';

const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';

beforeAll(() => runtime.setup());

test('[WHISPER-INPUT-MESSAGE-1] Read Message from Event', () => {
  expect(funlet.input.getMessage({ Message: MESSAGE }, {}, {})).toEqual(
    MESSAGE
  );
});

test('[WHISPER-INPUT-MESSAGE-2] Read Message from Environment', () => {
  expect(
    funlet.input.getMessage({}, { FUNLET_WHISPER_MESSAGE: MESSAGE }, {})
  ).toEqual(MESSAGE);
});

test('[WHISPER-INPUT-MESSAGE-3] Read Message from Script Config', () => {
  expect(funlet.input.getMessage({}, {}, { message: MESSAGE })).toEqual(
    MESSAGE
  );
});

test('[WHISPER-INPUT-MESSAGE-4] Read Default Message from Script Config', () => {
  expect(funlet.config.message(SPELLED_FROM_NUMBER)).toEqual(DEFAULT_MESSAGE);
});

test('[WHISPER-INPUT-LANGUAGE-1] Read Language from Event', () => {
  expect(funlet.input.getLanguage({ Language: FRENCH }, {}, {})).toEqual(
    FRENCH
  );
});

test('[WHISPER-INPUT-LANGUAGE-2] Read Language from Environment', () => {
  expect(
    funlet.input.getLanguage({}, { FUNLET_WHISPER_LANGUAGE: FRENCH }, {})
  ).toEqual(FRENCH);
});

test('[WHISPER-INPUT-LANGUAGE-3] Read Language from Script Config', () => {
  expect(funlet.input.getLanguage({}, {}, { language: FRENCH })).toEqual(
    FRENCH
  );
});

test('[WHISPER-INPUT-LANGUAGE-4] Read Default Language from Script Config', () => {
  expect(funlet.config.language).toEqual(DEFAULT_LANGUAGE);
});

test('[WHISPER-INPUT-VOICE-1] Read Voice from Event', () => {
  expect(funlet.input.getVoice({ Voice: MAN }, {}, {})).toEqual(MAN);
});

test('[WHISPER-INPUT-VOICE-2] Read Voice from Environment', () => {
  expect(
    funlet.input.getVoice({}, { FUNLET_WHISPER_VOICE: WOMAN }, {})
  ).toEqual(WOMAN);
});

test('[WHISPER-INPUT-VOICE-3] Read Default Voice from Script', () => {
  expect(funlet.input.getVoice({}, {}, { voice: WOMAN })).toEqual(WOMAN);
});

test('[WHISPER-INPUT-VOICE-4] Read Default Voice from Script Config', () => {
  expect(funlet.config.voice).toEqual(DEFAULT_VOICE);
});

test('[WHISPER-INPUT-HUMAN-CHECK-0] Read Human Check "1" from Event', () => {
  expect(
    funlet.input.isHumanCheckRequired({ HumanCheck: '1' }, {}, {})
  ).toEqual(true);
});

test('[WHISPER-INPUT-HUMAN-CHECK-1] Read Human Check from Event', () => {
  expect(
    funlet.input.isHumanCheckRequired({ HumanCheck: 'true' }, {}, {})
  ).toEqual(true);
});

test('[WHISPER-INPUT-HUMAN-CHECK-2] Read Human Check from Environment', () => {
  expect(
    funlet.input.isHumanCheckRequired(
      {},
      { FUNLET_WHISPER_HUMAN_CHECK: 'true' },
      {}
    )
  ).toEqual(true);
});

test('[WHISPER-INPUT-HUMAN-CHECK-3] Read Default Human Check from Script', () => {
  const DEFAULT_HUMAN_CHECK = false;
  expect(
    funlet.input.isHumanCheckRequired({}, {}, { humanCheck: true })
  ).toEqual(true);
});

test(
  '[WHISPER-INPUT-HUMAN-CHECK-3] ' +
    'Read Default Human Check from Script Config',
  () => {
    expect(funlet.config.humanCheck).toEqual(DEFAULT_HUMAN_CHECK);
  }
);

test('[WHISPER-INPUT-DIGITS-0] Read No Digits from Event', () => {
  expect(funlet.input.getDigits({}, {}, {})).toEqual(NO_DIGITS);
});

test('[WHISPER-INPUT-DIGITS-1] Read Empty Digits from Event', () => {
  expect(funlet.input.getDigits({ Digits: EMPTY_DIGITS }, {}, {})).toEqual(
    EMPTY_DIGITS
  );
});

test('[WHISPER-INPUT-DIGITS-2] Read Non-Empty Digits from Event', () => {
  expect(funlet.input.getDigits({ Digits: NON_EMPTY_DIGITS }, {}, {})).toEqual(
    NON_EMPTY_DIGITS
  );
});

test('[WHISPER-OUTPUT-SPELL-1] Spell a phone number digit by digit', () => {
  expect(funlet.output.spell(FROM_NUMBER)).toEqual(SPELLED_FROM_NUMBER);
});

test('[WHISPER-OUTPUT-WHISPER-1-2] Recorded Message', () => {
  const NO_HUMAN_CHECK = false;
  const WHISPER_TEXT_MESSAGE = `${XML_DECLARATION}<Response>\
<Gather numDigits="1">\
<Say language="${FRENCH}" voice="${WOMAN}">${TEXT_MESSAGE}</Say>\
</Gather>\
</Response>`;

  const response = new Twilio.twiml.VoiceResponse();
  funlet.output.sendWhisperMessage(
    response,
    NO_HUMAN_CHECK,
    TEXT_MESSAGE,
    FRENCH,
    WOMAN
  );
  expect(response.toString()).toEqual(WHISPER_TEXT_MESSAGE);
});

test('[WHISPER-OUTPUT-WHISPER-1-4] Human Check', () => {
  const HUMAN_CHECK = true;
  const WHISPER_RECORDED_MESSAGE_HUMAN_CHECK = `${XML_DECLARATION}<Response>\
<Gather numDigits="1">\
<Play>${RECORDED_MESSAGE}</Play>\
</Gather>\
<Hangup/>\
</Response>`;

  const response = new Twilio.twiml.VoiceResponse();
  funlet.output.sendWhisperMessage(
    response,
    HUMAN_CHECK,
    RECORDED_MESSAGE,
    DEFAULT_LANGUAGE,
    DEFAULT_VOICE
  );
  expect(response.toString()).toEqual(WHISPER_RECORDED_MESSAGE_HUMAN_CHECK);
});

test('[WHISPER-OUTPUT-WHISPER-2-0] No Digits Provided', () => {
  const EMPTY_RESPONSE = `${XML_DECLARATION}<Response/>`;
  const response = new Twilio.twiml.VoiceResponse();
  const hasDigits = funlet.output.checkDigitsEntered(response, NO_DIGITS);
  expect(hasDigits).toBe(false);
  expect(response.toString()).toEqual(EMPTY_RESPONSE);
});

test('[WHISPER-OUTPUT-WHISPER-2-1] A Digit was Pressed', () => {
  const EMPTY_RESPONSE = `${XML_DECLARATION}<Response/>`;
  const response = new Twilio.twiml.VoiceResponse();
  const hasDigits = funlet.output.checkDigitsEntered(
    response,
    NON_EMPTY_DIGITS
  );
  expect(hasDigits).toBe(true);
  expect(response.toString()).toEqual(EMPTY_RESPONSE);
});

test('[WHISPER-OUTPUT-WHISPER-2-2] No Digits were Pressed, Empty Digits Set', () => {
  const HANG_UP = `${XML_DECLARATION}<Response><Hangup/></Response>`;
  const response = new Twilio.twiml.VoiceResponse();
  const hasDigits = funlet.output.checkDigitsEntered(response, EMPTY_DIGITS);
  expect(hasDigits).toBe(true);
  expect(response.toString()).toEqual(HANG_UP);
});

test('[WHISPER-1-1] Full Response: Recorded Message', (done) => {
  const FULL_RESPONSE_WHISPER_1_1 = `${XML_DECLARATION}<Response>\
<Gather numDigits="1">\
<Play>${RECORDED_MESSAGE}</Play>\
</Gather>\
</Response>`;

  const callback = (_err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
    expect(result.toString()).toEqual(FULL_RESPONSE_WHISPER_1_1);
    done();
  };
  funlet.handler({}, { Message: RECORDED_MESSAGE }, callback);
});

test('[WHISPER-1-4] Full Response: Human Check', (done) => {
  const FULL_RESPONSE_WHISPER_1_4 = `${XML_DECLARATION}<Response>\
<Gather numDigits="1">\
<Say language="${DEFAULT_LANGUAGE}" voice="${DEFAULT_VOICE}">${TEXT_MESSAGE}</Say>\
</Gather>\
<Hangup/>\
</Response>`;

  const callback = (_err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
    expect(result.toString()).toEqual(FULL_RESPONSE_WHISPER_1_4);
    done();
  };
  funlet.handler({}, { Message: TEXT_MESSAGE, HumanCheck: 'true' }, callback);
});

test('[WHISPER-2-1] Full Response: A Digit was Pressed', (done) => {
  const FULL_RESPONSE_WHISPER_2_1 = `${XML_DECLARATION}<Response/>`;

  const callback = (_err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
    expect(result.toString()).toEqual(FULL_RESPONSE_WHISPER_2_1);
    done();
  };
  funlet.handler({}, { Digits: NON_EMPTY_DIGITS }, callback);
});

afterAll(() => runtime.teardown());
