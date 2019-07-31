const funlet = require('./funlet-simple-menu');
const Twilio = require('twilio');

const TEXT_MESSAGE="Text message";
const MESSAGE=TEXT_MESSAGE;
const DEFAULT_MESSAGE="";

const ENGLISH="en";
const FRENCH="fr";
const DEFAULT_LANGUAGE=ENGLISH;

const MAN="man";
const WOMAN="woman";
const ALICE="alice";
const DEFAULT_VOICE=ALICE;

const ACTION0="https://example.com/options/0";
const ACTION1="https://example.com/options/1";
const ACTION2="https://example.com/options/2";
const ACTION7="https://example.com/options/7";
const ACTION42="https://example.com/options/42";
const ACTION101="https://example.com/options/101";
const ACTION1234="https://example.com/options/1234";
const ACTION12345="https://example.com/options/12345";

const DEFAULT_OPTIONS={};

const NO_DIGITS="";
const NON_EMPTY_DIGITS="123";

const ERROR_MESSAGE="https://example.com/simple-menu/error.mp3";
const DEFAULT_ERROR_MESSAGE="I'm sorry, that wasn't a valid option."

const XML_DECLARATION='<?xml version="1.0" encoding="UTF-8"?>';

test('[SIMPLE-MENU-INPUT-MESSAGE-1] Read Message from Event',
() => {
  expect(
    funlet.input.getMessage({}, {Message:MESSAGE})
  ).toEqual( MESSAGE );
});

test('[SIMPLE-MENU-INPUT-MESSAGE-2] Read Message from Environment',
() => {
  expect(
    funlet.input.getMessage({FUNLET_MENU_MESSAGE:MESSAGE}, {})
  ).toEqual( MESSAGE );
});

test('[SIMPLE-MENU-INPUT-MESSAGE-3] Read Default Message from Script',
() => {
  expect(
    funlet.input.getMessage({}, {})
  ).toEqual( DEFAULT_MESSAGE );
});

test('[SIMPLE-MENU-INPUT-LANGUAGE-1] Read Language from Event',
() => {
  expect(
    funlet.input.getLanguage({}, {Language:FRENCH})
  ).toEqual( FRENCH );
});

test('[SIMPLE-MENU-INPUT-LANGUAGE-2] Read Language from Environment',
() => {
  expect(
    funlet.input.getLanguage({FUNLET_MENU_LANGUAGE:FRENCH}, {})
  ).toEqual( FRENCH );
});

test('[SIMPLE-MENU-INPUT-LANGUAGE-3] Read Default Language from Script',
() => {
  expect(
    funlet.input.getLanguage({}, {})
  ).toEqual( DEFAULT_LANGUAGE );
});

test('[SIMPLE-MENU-INPUT-VOICE-1] Read Voice from Event',
() => {
  expect(
    funlet.input.getVoice({}, {Voice:MAN})
  ).toEqual( MAN );
});

test('[SIMPLE-MENU-INPUT-VOICE-2] Read Voice from Environment',
() => {
  expect(
    funlet.input.getVoice({FUNLET_MENU_VOICE:WOMAN}, {})
  ).toEqual( WOMAN );
});

test('[SIMPLE-MENU-INPUT-VOICE-3] Read Default Voice from Script',
() => {
  expect(
    funlet.input.getVoice({}, {})
  ).toEqual( DEFAULT_VOICE );
});

test('[SIMPLE-MENU-INPUT-OPTIONS-1] Read Single Option from Event',
() => {
  expect(
    funlet.input.getOptions({}, {Options:ACTION0})
  ).toEqual( {"0":ACTION0} );
});

test('[SIMPLE-MENU-INPUT-OPTIONS-2] Read Sequential List of Options from Event',
() => {
  expect(
    funlet.input.getOptions({}, {Options:[ACTION0,ACTION1,ACTION2]})
  ).toEqual( {"0":ACTION0,"1":ACTION1,"2":ACTION2} );
});

test('[SIMPLE-MENU-INPUT-OPTIONS-3] Read List of Keys/Actions from Event',
() => {
  expect(
    funlet.input.getOptions({}, {
      "Options[42]":ACTION42,
      "Options[101]":ACTION101,
      "Options[1234]":ACTION1234
    })
  ).toEqual( {"42":ACTION42,"101":ACTION101,"1234":ACTION1234} );
});

test('[SIMPLE-MENU-INPUT-OPTIONS-4] Read Single Option from Environment',
() => {
  expect(
    funlet.input.getOptions({
      FUNLET_MENU_OPTION7_URL: ACTION7
    }, {})
  ).toEqual( {"7":ACTION7} );
});

test('[SIMPLE-MENU-INPUT-OPTIONS-5] Read Single Key/Action from Environment',
() => {
  expect(
    funlet.input.getOptions({
      FUNLET_MENU_OPTION4_DIGITS: 42,
      FUNLET_MENU_OPTION4_URL: ACTION42
    }, {})
  ).toEqual( {"42":ACTION42} );
});

test('[SIMPLE-MENU-INPUT-OPTIONS-6] Read Key/Action List from Environment',
() => {
  expect(
    funlet.input.getOptions({
      FUNLET_MENU_OPTION1_DIGITS: "42",
      FUNLET_MENU_OPTION1_URL: ACTION42,

      FUNLET_MENU_OPTION2_DIGITS: "101",
      FUNLET_MENU_OPTION2_URL: ACTION101,

      FUNLET_MENU_OPTION3_DIGITS: "1234",
      FUNLET_MENU_OPTION3_URL: ACTION1234
    }, {})
  ).toEqual( {"42":ACTION42,"101":ACTION101,"1234":ACTION1234} );
});

test('[SIMPLE-MENU-INPUT-OPTIONS-7] Read Default Options from Script',
() => {
  expect(
    funlet.input.getOptions({},{})
  ).toEqual( DEFAULT_OPTIONS );
});

test('[SIMPLE-MENU-INPUT-DIGITS-0] Read No Digits from Event',
() => {
  expect(
    funlet.input.getDigits({},{})
  ).toEqual( NO_DIGITS );
});

test('[SIMPLE-MENU-INPUT-DIGITS-1] Read Non-Empty Digits from Event',
() => {
  expect(
    funlet.input.getDigits({},{Digits:NON_EMPTY_DIGITS})
  ).toEqual( NON_EMPTY_DIGITS );
});

test('[SIMPLE-MENU-INPUT-ERROR-MESSAGE-1] Read Error Message from Event',
() => {
  expect(
    funlet.input.getErrorMessage({}, {ErrorMessage:ERROR_MESSAGE})
  ).toEqual( ERROR_MESSAGE );
});

test('[SIMPLE-MENU-INPUT-ERROR-MESSAGE-2] Read Error Message from Environment',
() => {
  expect(
    funlet.input.getErrorMessage({FUNLET_MENU_ERROR_MESSAGE:ERROR_MESSAGE}, {})
  ).toEqual( ERROR_MESSAGE );
});

test('[SIMPLE-MENU-INPUT-ERROR-MESSAGE-3] '+
     'Read Default Error Message from Script',
() => {
  expect(
    funlet.input.getErrorMessage({}, {})
  ).toEqual( DEFAULT_ERROR_MESSAGE );
});



test('[SIMPLE-MENU-OUTPUT-GATHER-DIGITS-0] Gather Digits Without Message',
() => {
  const EMPTY_MESSAGE="";
  const DIGITS = 5;
  const GATHER_DIGITS =
    XML_DECLARATION+
    '<Response>'+
      '<Gather numDigits="'+DIGITS+'"/>'+
    '</Response>';

  let response = new Twilio.twiml.VoiceResponse();
  let gather = funlet.output.gatherDigits(
    response, DIGITS, EMPTY_MESSAGE, DEFAULT_LANGUAGE, DEFAULT_VOICE
  );
  expect( response.toString() ).toEqual( GATHER_DIGITS );
});

test('[SIMPLE-MENU-OUTPUT-GATHER-DIGITS-1] '+
     'Gather Digits With Recorded Message',
() => {
  const RECORDED_MESSAGE="https://example.com/recorded-message.mp3";
  const DIGITS = 5;
  const PLAY_MESSAGE_GATHER_DIGITS =
    XML_DECLARATION+
    '<Response>'+
      '<Gather numDigits="'+DIGITS+'">'+
        '<Play>'+RECORDED_MESSAGE+'</Play>'+
      '</Gather>'+
    '</Response>';

  let response = new Twilio.twiml.VoiceResponse();
  let gather = funlet.output.gatherDigits(
    response, DIGITS, RECORDED_MESSAGE, DEFAULT_LANGUAGE, DEFAULT_VOICE
  );
  expect( response.toString() ).toEqual( PLAY_MESSAGE_GATHER_DIGITS );
});

test('[SIMPLE-MENU-OUTPUT-GATHER-DIGITS-2] Gather Digits With Text Message',
() => {
  const DIGITS = 5;
  const SAY_MESSAGE_GATHER_DIGITS =
    XML_DECLARATION+
    '<Response>'+
      '<Gather numDigits="'+DIGITS+'">'+
        '<Say language="'+FRENCH+'" voice="'+WOMAN+'">'+TEXT_MESSAGE+'</Say>'+
      '</Gather>'+
    '</Response>';

  let response = new Twilio.twiml.VoiceResponse();
  let gather = funlet.output.gatherDigits(
    response, DIGITS, TEXT_MESSAGE, FRENCH, WOMAN
  );
  expect( response.toString() ).toEqual( SAY_MESSAGE_GATHER_DIGITS );
});

test('[SIMPLE-MENU-OUTPUT-SIMPLE-MENU-1-3] Multiple Digits to Gather',
() => {
  const DIGITS = "12345".length;
  const GATHER_MULTIPLE_DIGITS =
    XML_DECLARATION+
    '<Response>'+
      '<Gather numDigits="'+DIGITS+'">'+
        '<Say language="'+FRENCH+'" voice="'+WOMAN+'">'+TEXT_MESSAGE+'</Say>'+
      '</Gather>'+
      '<Redirect/>'+
    '</Response>';
  let response = new Twilio.twiml.VoiceResponse();
  funlet.output.simpleMenuStage1(
    response, TEXT_MESSAGE, FRENCH, WOMAN, {"12345":ACTION12345}
  );
  expect( response.toString() ).toEqual( GATHER_MULTIPLE_DIGITS );
});

test('[SIMPLE-MENU-OUTPUT-SIMPLE-MENU-2-0] No Digits',
() => {
  const EMPTY_RESPONSE =
    XML_DECLARATION+
    '<Response/>';
  let response = new Twilio.twiml.VoiceResponse();
  let hasMatch = funlet.output.simpleMenuStage2(
    response, "", {"12345":ACTION12345}, ERROR_MESSAGE, FRENCH, MAN
  );
  expect( hasMatch ).toBe( false );
  expect( response.toString() ).toEqual( EMPTY_RESPONSE );
});

test('[SIMPLE-MENU-OUTPUT-SIMPLE-MENU-2-1] Digits Pressed Match an Option',
() => {
  const REDIRECT_TO_MATCHING_OPTION =
    XML_DECLARATION+
    '<Response>'+
      '<Redirect>'+ACTION12345+'</Redirect>'+
    '</Response>';
  let response = new Twilio.twiml.VoiceResponse();
  let hasMatch = funlet.output.simpleMenuStage2(
    response, "12345", {"12345":ACTION12345}, ERROR_MESSAGE, FRENCH, MAN
  );
  expect( hasMatch ).toBe( true );
  expect( response.toString() ).toEqual( REDIRECT_TO_MATCHING_OPTION );
});

test('[SIMPLE-MENU-OUTPUT-SIMPLE-MENU-2-2] '+
     'Digits Pressed Do Not Match Any Option',
() => {
  const PLAY_ERROR_MESSAGE =
    XML_DECLARATION+
    '<Response>'+
      '<Play>'+ERROR_MESSAGE+'</Play>'+
    '</Response>';
  let response = new Twilio.twiml.VoiceResponse();
  let hasMatch = funlet.output.simpleMenuStage2(
    response, "42", {"12345":ACTION12345}, ERROR_MESSAGE, FRENCH, MAN
  );
  expect( hasMatch ).toBe( false );
  expect( response.toString() ).toEqual( PLAY_ERROR_MESSAGE );
});

test('[SIMPLE-MENU-1-2] Full Response: Text Message', done => {
  const FULL_RESPONSE_SIMPLE_MENU_1_2 =
    XML_DECLARATION+
    '<Response>'+
      '<Gather numDigits="1">'+
        '<Say language="'+DEFAULT_LANGUAGE+'" voice="'+DEFAULT_VOICE+'">'+
          TEXT_MESSAGE+
        '</Say>'+
      '</Gather>'+
      '<Redirect/>'+
    '</Response>';

  const callback = (err, result) => {
    expect( result ).toBeInstanceOf( Twilio.twiml.VoiceResponse );
    expect( result.toString() ).toEqual( FULL_RESPONSE_SIMPLE_MENU_1_2 );
    done();
  };
  funlet.handler({}, {Message:TEXT_MESSAGE}, callback);
});
