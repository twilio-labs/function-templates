const funlet = require('./funlet-find-me');
const Twilio = require('twilio');

const PHONE_NUMBER1='415-555-1212';
const PHONE_NUMBER2='415-555-1313';
const PHONE_NUMBER3='415-555-1414';
const PHONE_NUMBER4='415-555-1515';
const PHONE_NUMBER5='415-555-1616';
const DEFAULT_PHONE_NUMBERS=[];

const TIMEOUT_STRING="42";
const TIMEOUT=42;
const DEFAULT_TIMEOUT=60;

const WHISPER=true;
const NO_WHISPER=false;

const FROM_NUMBER="+19165550123";
const SPELLED_FROM_NUMBER="+. 1. 9. 1. 6. 5. 5. 5. 0. 1. 2. 3. ";

const RECORDED_MESSAGE="https://example.com/recorded-message.mp3";
const TEXT_MESSAGE="Text message";
const MESSAGE=TEXT_MESSAGE;
const DEFAULT_MESSAGE=
  'You are receiving a call from '+SPELLED_FROM_NUMBER+'. '+
  'Press any key to accept.';

const CUSTOM_MESSAGE="Custom Message";
const CUSTOM_MESSAGE_ENCODED="Custom%20Message";

const ENGLISH="en";
const FRENCH="fr";
const DEFAULT_LANGUAGE=ENGLISH;

const MAN="man";
const WOMAN="woman";
const ALICE="alice";
const DEFAULT_VOICE=ALICE;

const DEFAULT_HUMAN_CHECK = true;

const NO_DIGITS = null;
const EMPTY_DIGITS="";
const NON_EMPTY_DIGITS="5";

const DIAL_DONE = true;
const DIAL_NOT_DONE = false;

const NO_CALL_STATUS="";
const CALL_ANSWERED="answered";
const CALL_COMPLETED="completed";
const CALL_BUSY="busy";

const FALLBACK_URL="https://example.com/please-try-later.mp3";
const FALLBACK_URL_ENCODED="https%3A%2F%2Fexample.com%2Fplease-try-later.mp3";
const NO_FALLBACK_URL="";
const DEFAULT_FALLBACK_URL=NO_FALLBACK_URL;

const DEFAULT_WHISPER_URL=".?Whisper=true";
const XML_DEFAULT_WHISPER_URL=".?Whisper=true";
const XML_WHISPER_URL_WITH_CUSTOM_MESSAGE=
  XML_DEFAULT_WHISPER_URL+"&amp;Message="+CUSTOM_MESSAGE_ENCODED;

const XML_DECLARATION='<?xml version="1.0" encoding="UTF-8"?>';

const FULL_RESPONSE_FIND_ME_1_1=
  XML_DECLARATION+
  '<Response>'+
    '<Dial '+
      'action=".?Dial=true'+
        '&amp;PhoneNumbers%5B%5D='+PHONE_NUMBER2+
        '&amp;PhoneNumbers%5B%5D='+PHONE_NUMBER3+
      '" '+
      'timeout="'+DEFAULT_TIMEOUT+'"'+
    '>'+
      '<Number url="'+XML_DEFAULT_WHISPER_URL+'">'+PHONE_NUMBER1+'</Number>'+
    '</Dial>'+
  '</Response>';

const FULL_RESPONSE_FIND_ME_1_3=
  XML_DECLARATION+
  '<Response>'+
    '<Dial '+
      'action=".?Dial=true'+
        '&amp;PhoneNumbers%5B%5D='+PHONE_NUMBER2+
        '&amp;PhoneNumbers%5B%5D='+PHONE_NUMBER3+
      '" '+
      'timeout="'+TIMEOUT+'"'+
    '>'+
      '<Number url="'+XML_WHISPER_URL_WITH_CUSTOM_MESSAGE+'">'+
        PHONE_NUMBER1+
      '</Number>'+
    '</Dial>'+
  '</Response>';

const FULL_RESPONSE_FIND_ME_2_1=
  XML_DECLARATION+
  '<Response>'+
    '<Gather numDigits="1">'+
      '<Play>'+RECORDED_MESSAGE+'</Play>'+
    '</Gather>'+
    '<Hangup/>'+
  '</Response>';

const FULL_RESPONSE_FIND_ME_3_1=
  XML_DECLARATION+
  '<Response/>';

const FULL_RESPONSE_FIND_ME_4_3=
  XML_DECLARATION+
  '<Response>'+
    '<Redirect>'+FALLBACK_URL+'</Redirect>'+
  '</Response>';

test('[FINDME-INPUT-PHONE-NUMBERS-1] Read Single Phone Number from Event',
() => {
  expect(
    funlet.input.getPhoneNumbers({PhoneNumbers:PHONE_NUMBER1}, {}, {})
  ).toEqual( [PHONE_NUMBER1] );
});

test('[FINDME-INPUT-PHONE-NUMBERS-2] Read List of Phone Numbers from Event',
() => {
  expect(
    funlet.input.getPhoneNumbers({
      PhoneNumbers:[
        PHONE_NUMBER1,
        PHONE_NUMBER2,
        PHONE_NUMBER3
      ]
    }, {}, {})
  ).toEqual( [
    PHONE_NUMBER1,
    PHONE_NUMBER2,
    PHONE_NUMBER3
  ] );
});

test('[FINDME-INPUT-PHONE-NUMBERS-3] '+
     'Read Single Phone Number from Environment',
() => {
  expect(
    funlet.input.getPhoneNumbers({}, {
      FUNLET_FINDME_PHONE_NUMBER1:PHONE_NUMBER1
    }, {})
  ).toEqual( [PHONE_NUMBER1] );
});

test('[FINDME-INPUT-PHONE-NUMBERS-4] '+
     'Read Five Phone Numbers from Environment',
() => {
  expect(
    funlet.input.getPhoneNumbers({}, {
      FUNLET_FINDME_PHONE_NUMBER1:PHONE_NUMBER1,
      FUNLET_FINDME_PHONE_NUMBER2:PHONE_NUMBER2,
      FUNLET_FINDME_PHONE_NUMBER3:PHONE_NUMBER3,
      FUNLET_FINDME_PHONE_NUMBER4:PHONE_NUMBER4,
      FUNLET_FINDME_PHONE_NUMBER5:PHONE_NUMBER5
    }, {})
  ).toEqual( [
    PHONE_NUMBER1,
    PHONE_NUMBER2,
    PHONE_NUMBER3,
    PHONE_NUMBER4,
    PHONE_NUMBER5
  ] );
});

test('[FINDME-INPUT-PHONE-NUMBERS-5] '+
     'Read Phone Numbers from Script Config',
() => {
  expect(
    funlet.input.getPhoneNumbers({}, {}, {
      phoneNumbers: [
        PHONE_NUMBER1,
        PHONE_NUMBER2,
        PHONE_NUMBER3
      ]
    })
  ).toEqual([
    PHONE_NUMBER1,
    PHONE_NUMBER2,
    PHONE_NUMBER3
  ]);
});

test('[FINDME-INPUT-PHONE-NUMBERS-6] '+
     'Read Default Phone Numbers from Script Config',
() => {
  expect( funlet.config.phoneNumbers ).toEqual( DEFAULT_PHONE_NUMBERS );
});

test('[FINDME-INPUT-PHONE_NUMBERS-7] Skip empty values',
() => {
  expect(
    funlet.input.getPhoneNumbers({}, {
      FUNLET_FINDME_PHONE_NUMBER1:PHONE_NUMBER1,
      FUNLET_FINDME_PHONE_NUMBER2:"",
      FUNLET_FINDME_PHONE_NUMBER3:PHONE_NUMBER3,
      FUNLET_FINDME_PHONE_NUMBER4:"",
      FUNLET_FINDME_PHONE_NUMBER5:PHONE_NUMBER5
    }, {})
  ).toEqual( [
    PHONE_NUMBER1,
    PHONE_NUMBER3,
    PHONE_NUMBER5
  ] );
});

test('[FINDME-INPUT-TIMEOUT-1] Read Timeout from Event',
() => {
  expect(
    funlet.input.getTimeout({Timeout:TIMEOUT_STRING}, {}, {})
  ).toEqual( TIMEOUT );
});

test('[FINDME-INPUT-TIMEOUT-2] Read Timeout from Environment',
() => {
  expect(
    funlet.input.getTimeout({}, {FUNLET_FINDME_TIMEOUT:TIMEOUT_STRING}, {})
  ).toEqual( TIMEOUT );
});

test('[FINDME-INPUT-TIMEOUT-3] Read Timeout from Script Config',
() => {
  expect(
    funlet.input.getTimeout({}, {}, {timeout: TIMEOUT})
  ).toEqual( TIMEOUT );
});

test('[FINDME-INPUT-TIMEOUT-4] Read Default Timeout from Script Config',
() => {
  expect( funlet.config.timeout ).toEqual( DEFAULT_TIMEOUT );
});

test('[FINDME-INPUT-DIAL-0] Read No Whisper from Event',
() => {
  expect(
    funlet.input.isWhisper({}, {}, {})
  ).toEqual( NO_WHISPER );
});

test('[FINDME-INPUT-DIAL-1] Read Whisper from Event',
() => {
  expect(
    funlet.input.isWhisper({Whisper:"true"}, {}, {})
  ).toEqual( WHISPER );
});

test('[FINDME-INPUT-MESSAGE-1] Read Message from Event',
() => {
  expect(
    funlet.input.getMessage({Message:MESSAGE}, {}, {})
  ).toEqual( MESSAGE );
});

test('[FINDME-INPUT-MESSAGE-2] Read Message from Environment',
() => {
  expect(
    funlet.input.getMessage({}, {FUNLET_FINDME_MESSAGE:MESSAGE}, {})
  ).toEqual( MESSAGE );
});

test('[FINDME-INPUT-MESSAGE-3] Read Message from Script Config',
() => {
  expect(
    funlet.input.getMessage({}, {}, {message: MESSAGE})
  ).toEqual( MESSAGE );
});

test('[FINDME-INPUT-MESSAGE-4] Read Default Message from Script Config',
() => {
  expect(
    funlet.config.message( SPELLED_FROM_NUMBER )
  ).toEqual( DEFAULT_MESSAGE );
});

test('[FINDME-INPUT-LANGUAGE-1] Read Language from Event',
() => {
  expect(
    funlet.input.getLanguage({Language:FRENCH}, {}, {})
  ).toEqual( FRENCH );
});

test('[FINDME-INPUT-LANGUAGE-2] Read Language from Environment',
() => {
  expect(
    funlet.input.getLanguage({}, {FUNLET_FINDME_LANGUAGE:FRENCH}, {})
  ).toEqual( FRENCH );
});

test('[FINDME-INPUT-LANGUAGE-3] Read Language from Script Config',
() => {
  expect(
    funlet.input.getLanguage({}, {}, {language: FRENCH})
  ).toEqual( FRENCH );
});

test('[FINDME-INPUT-LANGUAGE-4] Read Default Language from Script Config',
() => {
  expect( funlet.config.language ).toEqual( DEFAULT_LANGUAGE );
});

test('[FINDME-INPUT-VOICE-1] Read Voice from Event',
() => {
  expect(
    funlet.input.getVoice({Voice:MAN}, {}, {})
  ).toEqual( MAN );
});

test('[FINDME-INPUT-VOICE-2] Read Voice from Environment',
() => {
  expect(
    funlet.input.getVoice({}, {FUNLET_FINDME_VOICE:WOMAN}, {})
  ).toEqual( WOMAN );
});

test('[FINDME-INPUT-VOICE-3] Read Voice from Script Config',
() => {
  expect(
    funlet.input.getVoice({}, {}, {voice: WOMAN})
  ).toEqual( WOMAN );
});

test('[FINDME-INPUT-VOICE-4] Read Default Voice from Script Config',
() => {
  expect( funlet.config.voice ).toEqual( DEFAULT_VOICE );
});

test('[WHISPER-INPUT-HUMAN-CHECK-0] Read Human Check "1" from Event',
() => {
  expect(
    funlet.input.isHumanCheckRequired({HumanCheck:"1"}, {}, {})
  ).toEqual( true );
});

test('[FINDME-INPUT-HUMAN-CHECK-1] Read Human Check from Event',
() => {
  expect(
    funlet.input.isHumanCheckRequired({HumanCheck:"true"}, {}, {})
  ).toEqual( true );
});

test('[FINDME-INPUT-HUMAN-CHECK-2] Read Human Check from Environment',
() => {
  expect(
    funlet.input.isHumanCheckRequired(
      {}, {FUNLET_FINDME_HUMAN_CHECK:"true"}, {}
    )
  ).toEqual( true );
});

test('[FINDME-INPUT-HUMAN-CHECK-3] Read Human Check from Script Config',
() => {
  expect(
    funlet.input.isHumanCheckRequired({}, {}, {humanCheck: true})
  ).toEqual( true );
});

test('[FINDME-INPUT-HUMAN-CHECK-4] '+
     'Read Default Human Check from Script Config',
() => {
  expect( funlet.config.humanCheck ).toEqual( DEFAULT_HUMAN_CHECK );
});

test('[FINDME-INPUT-DIGITS-0] Read No Digits from Event',
() => {
  expect(
    funlet.input.getDigits({},{},{})
  ).toEqual( NO_DIGITS );
});

test('[FINDME-INPUT-DIGITS-1] Read Empty Digits from Event',
() => {
  expect(
    funlet.input.getDigits({Digits:EMPTY_DIGITS}, {}, {})
  ).toEqual( EMPTY_DIGITS );
});

test('[FINDME-INPUT-DIGITS-2] Read Non-Empty Digits from Event',
() => {
  expect(
    funlet.input.getDigits({Digits:NON_EMPTY_DIGITS}, {}, {})
  ).toEqual( NON_EMPTY_DIGITS );
});

test('[FINDME-INPUT-DIAL-0] Read No Dial from Event',
() => {
  expect(
    funlet.input.isDialDone({}, {}, {})
  ).toEqual( DIAL_NOT_DONE );
});

test('[FINDME-INPUT-DIAL-1] Read Dial from Event',
() => {
  expect(
    funlet.input.isDialDone({Dial:"true"}, {}, {})
  ).toEqual( DIAL_DONE );
});

test('[FINDME-INPUT-CALL-STATUS-0] Read No Call Status from Event',
() => {
  expect(
    funlet.input.getCallStatus({}, {}, {})
  ).toEqual( NO_CALL_STATUS );
});

test('[FINDME-INPUT-CALL-STATUS-1] Read Answered Call Status from Event',
() => {
  expect(
    funlet.input.getCallStatus({DialStatus:CALL_ANSWERED}, {}, {})
  ).toEqual( CALL_ANSWERED );
});

test('[FINDME-INPUT-CALL-STATUS-2] Read Completed Call Status from Event',
() => {
  expect(
    funlet.input.getCallStatus({DialCallStatus:CALL_COMPLETED}, {}, {})
  ).toEqual( CALL_COMPLETED );
});

test('[FINDME-INPUT-CALL-STATUS-3] Read Busy Call Status from Event',
() => {
  expect(
    funlet.input.getCallStatus({DialCallStatus:CALL_BUSY}, {}, {})
  ).toEqual( CALL_BUSY );
});

test('[FINDME-INPUT-FALLBACK-URL-1] Read Fallback URL from Event',
() => {
  expect(
    funlet.input.getFallbackUrl({FailUrl:FALLBACK_URL}, {}, {})
  ).toEqual( FALLBACK_URL );
});

test('[FINDME-INPUT-FALLBACK-URL-2] Read Fallback URL from Environment',
() => {
  expect(
    funlet.input.getFallbackUrl(
      {}, {FUNLET_FINDME_FALLBACK_URL:FALLBACK_URL}, {}
    )
  ).toEqual( FALLBACK_URL );
});

test('[FINDME-INPUT-FALLBACK-URL-3] Read Fallback URL from Script Config',
() => {
  expect(
    funlet.input.getFallbackUrl({}, {}, {fallbackUrl: FALLBACK_URL})
  ).toEqual( FALLBACK_URL );
});

test('[FINDME-INPUT-FALLBACK-URL-4] Read Default Fallback URL from Script',
() => {
  expect( funlet.config.fallbackUrl ).toEqual( DEFAULT_FALLBACK_URL );
});

test('[FINDME-OUTPUT-FINDME-1-1] Find Me with 3 Phone Numbers',
() => {
  let response = new Twilio.twiml.VoiceResponse();
  funlet.output.findMeStage1(
    response,
    [PHONE_NUMBER1,PHONE_NUMBER2,PHONE_NUMBER3],
    DEFAULT_TIMEOUT, DEFAULT_WHISPER_URL, NO_FALLBACK_URL
  );
  expect( response.toString() ).toEqual( FULL_RESPONSE_FIND_ME_1_1 );
});

test('[FINDME-1-3] Find Me with Custom Timeout and Message', done => {
  const callback = (err, result) => {
    expect( result ).toBeInstanceOf( Twilio.twiml.VoiceResponse );
    expect( result.toString() ).toEqual( FULL_RESPONSE_FIND_ME_1_3 );
    done();
  };
  funlet.handler({}, {
    PhoneNumbers: [PHONE_NUMBER1,PHONE_NUMBER2,PHONE_NUMBER3],
    Message: CUSTOM_MESSAGE, Timeout: TIMEOUT_STRING
  }, callback);
});

test('[FINDME-2-1] Whisper: Recorded Message', done => {
  const callback = (err, result) => {
    expect( result ).toBeInstanceOf( Twilio.twiml.VoiceResponse );
    expect( result.toString() ).toEqual( FULL_RESPONSE_FIND_ME_2_1 );
    done();
  };
  funlet.handler({}, {Whisper:"true",Message:RECORDED_MESSAGE}, callback);
});

test('[FINDME-3-1] Whisper: A Digit was Pressed', done => {
  const callback = (err, result) => {
    expect( result ).toBeInstanceOf( Twilio.twiml.VoiceResponse );
    expect( result.toString() ).toEqual( FULL_RESPONSE_FIND_ME_3_1 );
    done();
  };
  funlet.handler({}, {Digits:NON_EMPTY_DIGITS}, callback);
});

test('[FINDME-4-3] Failure with Fallback URL', done => {
  const callback = (err, result) => {
    expect( result ).toBeInstanceOf( Twilio.twiml.VoiceResponse );
    expect( result.toString() ).toEqual( FULL_RESPONSE_FIND_ME_4_3 );
    done();
  };
  funlet.handler({}, {
    Dial:"true", DialCallStatus:"busy", FailUrl:FALLBACK_URL
  }, callback);
});
