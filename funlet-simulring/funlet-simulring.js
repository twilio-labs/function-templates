// # Simulring Funlet
// Forward the call to up to 10 forwarding numbers in parallel,
// connecting the first one that picks up (stage 1). When that
// forwarding call ends, just hang up if it was successful,
// or redirect to the fallback URL/Funlet, if any (stage 2).

// ## Script Parameters

// list of forwarding phone numbers
const MY_PHONE_NUMBERS=[];

// duration in seconds to let the call ring before the recipient picks up
const MY_TIMEOUT=20;

// recording URL or text message to say,
// e.g. asking the recipient to press a key to accept the call
const MY_MESSAGE = fromNumber =>
`You are receiving a call from ${fromNumber}. Press any key to accept.`;

// language code for conversion of text-to-speech messages,
// e.g. 'en' or 'en-gb'
const MY_LANGUAGE = "en";

// voice for text-to-speech messages, one of 'man', 'woman' or 'alice'
const MY_VOICE = "alice";

// whether to request the recipient to press a key to accept the call
const MY_HUMAN_CHECK = false;

// fallback URL where further instructions are requested
// when the forwarding call fails
const MY_FALLBACK_URL="";

// ## Input
exports.input = {};

function getPhoneNumbers(env, params) {
  let phoneNumbers = [];

  function addIfNotEmpty( phoneNumber ) {
    if ( typeof phoneNumber === "string" && phoneNumber !== "" ) {
      phoneNumbers.push( phoneNumber );
    }
  }

  if ( Array.isArray(params.PhoneNumbers) ) {
    params.PhoneNumbers.forEach(
      phoneNumber => addIfNotEmpty(phoneNumber)
    );
  } else {
    addIfNotEmpty( params.PhoneNumbers );
  }

  addIfNotEmpty( env.FUNLET_SIMULRING_PHONE_NUMBER1 );
  addIfNotEmpty( env.FUNLET_SIMULRING_PHONE_NUMBER2 );
  addIfNotEmpty( env.FUNLET_SIMULRING_PHONE_NUMBER3 );
  addIfNotEmpty( env.FUNLET_SIMULRING_PHONE_NUMBER4 );
  addIfNotEmpty( env.FUNLET_SIMULRING_PHONE_NUMBER5 );

  MY_PHONE_NUMBERS.forEach(
    phoneNumber => addIfNotEmpty(phoneNumber)
  );

  return phoneNumbers;
}
exports.input.getPhoneNumbers = getPhoneNumbers;

function getTimeout(env, params) {
  let timeout = params.Timeout || env.FUNLET_SIMULRING_TIMEOUT;
  if ( typeof timeout === "string" && !isNaN(timeout) ) {
    return Number(timeout);
  }
  return MY_TIMEOUT;
}
exports.input.getTimeout = getTimeout;

function isWhisper(env, params) {
  return ( typeof params.Whisper === "string" );
}
exports.input.isWhisper = isWhisper;

function getMessage(env, params) {
  const caller = params.From || params.Caller || "";
  return params.Message ||
    env.FUNLET_SIMULRING_MESSAGE ||
    MY_MESSAGE( spell(caller) );
}
exports.input.getMessage = getMessage;

function getLanguage(env, params) {
  return params.Language || env.FUNLET_SIMULRING_LANGUAGE || MY_LANGUAGE;
}
exports.input.getLanguage = getLanguage;

function getVoice(env, params) {
  return params.Voice || env.FUNLET_SIMULRING_VOICE || MY_VOICE;
}
exports.input.getVoice = getVoice;

function isHumanCheckRequired(env, params) {
  if ( typeof params.HumanCheck === "string" ) {
    return true;
  }
  if ( typeof env.FUNLET_SIMULRING_HUMAN_CHECK === "string" ) {
    return env.FUNLET_SIMULRING_HUMAN_CHECK === "true";
  }
  return MY_HUMAN_CHECK;
}
exports.input.isHumanCheckRequired = isHumanCheckRequired;

function getDigits(env, params) {
  if ( typeof params.Digits === "string" ) {
   return params.Digits;
  }
  return null;
}
exports.input.getDigits = getDigits;

function isDialDone(env, params) {
  return (typeof params.Dial === "string" );
}
exports.input.isDialDone = isDialDone;

// Copied from Forward Funlet
function getCallStatus(env, params) {
  const NO_CALL_STATUS = "";
  return params.DialStatus || params.DialCallStatus || NO_CALL_STATUS;
}
exports.input.getCallStatus = getCallStatus;

function getFallbackUrl(env, params) {
  return params.FailUrl ||
    env.FUNLET_SIMULRING_FALLBACK_URL ||
    MY_FALLBACK_URL;
}
exports.input.getFallbackUrl = getFallbackUrl;

// ## Dependencies
const Twilio = require('twilio');

// ## Output
exports.output = {};

// Copied from Whisper Funlet
function spell( numberString ) {
  const PAUSE = '. ';
  return numberString.split('').join(PAUSE)+PAUSE;
}
exports.output.spell = spell;

// Copied from Call Me Funlet
function getWhisperUrl( params ) {
  const
   BASE_WHISPER_URL=".?Whisper=true",
   SEP="&";

  let whisperUrl = BASE_WHISPER_URL;

  function copyStringParam( name ) {
    let value = params[name];
    if ( typeof value === "string" ) {
      whisperUrl += SEP + name + "=" + encodeURIComponent( value );
    }
  }

  copyStringParam( "Message" );
  copyStringParam( "Language" );
  copyStringParam( "Voice" );

  return whisperUrl;
}
exports.output.getWhisperUrl = getWhisperUrl;

// Copied from Forward Funlet
function getForwardActionUrl( fallbackUrl ) {
  const BASE_URL = ".";
  let actionUrl = BASE_URL + "?Dial=true";
  if ( fallbackUrl !== "" ) {
    actionUrl += "&" + encodeURIComponent(fallbackUrl);
  }
  return actionUrl;
}
exports.output.getForwardActionUrl = getForwardActionUrl;

/*
  Function: simulringStage1()

  Parameters:
    * response - Twilio.twiml.VoiceResponse, Twilio Voice response in progress
    * forwardingNumbers - string, the list of forwarding numbers
    * timeout - number, duration in seconds to let the forwarding call ring
                before the recipient picks up
    * whisperUrl - string, action URL to trigger the Whisper Funlet and get
                   instructions which ask the recipient to accept the call
    * fallbackUrl - string, URL of a script with further instructions
                    in case the forwarding call fails

  Response:
    The response is modified with instructions to:
      - forward the call to the first of the forwarding numbers
        to answer a simultaneous call, with given timeout,
      - to play a message asking the recipient to accept
        the call by pressing a key,
      - and to redirect to the given fallback URL
        if the forwarding call fails.
*/
function simulringStage1(
  response, forwardingNumbers, timeout, whisperUrl, fallbackUrl
) {
  let dial = response.dial({
    action: getForwardActionUrl( fallbackUrl ),
    timeout: timeout
  });
  forwardingNumbers.forEach(
    forwardingNumber => dial.number( {url:whisperUrl}, forwardingNumber )
  );
}
exports.output.simulringStage1 = simulringStage1;

// Copied from Simple Message Funlet
function simpleMessage(response, message, language, voice) {
  if ( message.length === 0 ) {
    return;
  }
  if ( message.startsWith("http") ) {
    response.play({}, message);
  } else {
    response.say({language:language, voice:voice}, message);
  }
}
exports.output.simpleMessage = simpleMessage;

// Copied from Simple Menu Funlet
function gatherDigits(response, maxDigits, message, language, voice) {
  simpleMessage(
    response.gather({numDigits: maxDigits}),
    message,
    language,
    voice
  );
}
exports.output.gatherDigits = gatherDigits;

// Copied from Whisper Funlet
function whisperStage1(response, humanCheck, message, language, voice) {
  gatherDigits(response, 1, message, language, voice);
  if ( humanCheck ) {
    response.hangup();
  }
}
let simulringStage2 = whisperStage1;
exports.output.simulring2 = simulringStage2;

// Copied from Whisper Funlet
function whisperStage2(response, digits) {
  if ( digits === null ) {
    return false;
  }
  if ( digits==="" ) {
    response.hangup();
  }
  return true;
}
let simulringStage3 = whisperStage2;
exports.output.simulringStage3 = simulringStage3;

// Copied from Forward Funlet
function forwardStage2(response, isDialDone, callStatus, fallbackUrl) {
  if (isDialDone) {
    if (
      callStatus !== "answered" &&
      callStatus !== "completed" &&
      fallbackUrl !== ""
    ) {
      response.redirect( fallbackUrl );
    } else {
      response.hangup();
    }
  }
  return isDialDone;
}
let simulringStage4 = forwardStage2;
exports.output.simulringStage4 = simulringStage4;

exports.handler = function(env, params, reply) {
  const NO_ERROR = null;

  let
    response = new Twilio.twiml.VoiceResponse(),
    callStatus = getCallStatus(env, params),
    fallbackUrl = getFallbackUrl(env, params),
    digits = getDigits(env, params),
    humanCheckRequired = isHumanCheckRequired(env, params),
    message = getMessage(env, params),
    language = getLanguage(env, params),
    voice = getVoice(env, params),
    forwardingNumbers = getPhoneNumbers(env, params),
    timeout = getTimeout(env, params),
    whisperUrl = getWhisperUrl(params);

  simulringStage4(response, isDialDone(env,params), callStatus, fallbackUrl) ||
  simulringStage3(response, digits) ||
  (isWhisper(env, params)?
    simulringStage2(response, humanCheckRequired, message, language, voice):
    simulringStage1(
      response, forwardingNumbers, timeout, whisperUrl, fallbackUrl
    )
  );

  reply(NO_ERROR, response);
};
