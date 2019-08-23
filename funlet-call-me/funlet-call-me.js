// # Call Me Funlet
// Forward the call to your forwarding number (stage 1)
// then hang up, or if the call failed, redirect the caller
// to a fallback URL/Funlet (stage 2)

// ## Script Parameters

// the forwarding number
const MY_PHONE_NUMBER="";

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

function getPhoneNumber(env, params) {
  return params.PhoneNumber ||
    env.FUNLET_CALLME_PHONE_NUMBER ||
    MY_PHONE_NUMBER;
}
exports.input.getPhoneNumber = getPhoneNumber;

function getTimeout(env, params) {
  let timeout = params.Timeout || env.FUNLET_CALLME_TIMEOUT;
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
    env.FUNLET_CALLME_MESSAGE ||
    MY_MESSAGE( spell(caller) );
}
exports.input.getMessage = getMessage;

function getLanguage(env, params) {
  return params.Language || env.FUNLET_CALLME_LANGUAGE || MY_LANGUAGE;
}
exports.input.getLanguage = getLanguage;

function getVoice(env, params) {
  return params.Voice || env.FUNLET_CALLME_VOICE || MY_VOICE;
}
exports.input.getVoice = getVoice;

function isHumanCheckRequired(env, params) {
  if ( typeof params.HumanCheck === "string" ) {
    return true;
  }
  if ( typeof env.FUNLET_CALLME_HUMAN_CHECK === "string" ) {
    return env.FUNLET_CALLME_HUMAN_CHECK === "true";
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
    env.FUNLET_CALLME_FALLBACK_URL ||
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
  Function: getWhisperUrl()

  Parameter:
    params - object, the set of HTTP parameters received by the Funlet

  Returns:
    string, the URL with parameters to play a message to the recipient of
    the forwarded call using the Whisper Funlet
*/
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

/*
  Function: callMeStage1()

  Parameters:
    * response - Twilio.twiml.VoiceResponse, Twilio Voice response in progress
    * forwardingNumber - string, the forwarding number
    * timeout - number, duration in seconds to let the forwarding call ring
                before the recipient picks up
    * whisperUrl - string, action URL to trigger the Whisper Funlet and get
                   instructions which ask the recipient to accept the call
    * fallbackUrl - string, URL of a script with further instructions
                    in case the forwarding call fails

  Response:
    The response is modified with instructions to forward the call to the
    given forwarding number, with given timeout, to play a message asking the
    recipient to accept the call by pressing a key, and to redirect to the
    given fallback URL if the forwarding call fails.
*/
function callMeStage1(
  response, forwardingNumber, timeout, whisperUrl, fallbackUrl
) {
  let dial = response.dial({
    action: getForwardActionUrl( fallbackUrl ),
    timeout: timeout
  });
  dial.number( {url:whisperUrl}, forwardingNumber );
}
exports.output.callMeStage1 = callMeStage1;

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
let callMeStage2 = whisperStage1;
exports.output.callMeStage2 = callMeStage2;

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
let callMeStage3 = whisperStage2;
exports.output.callMeStage3 = callMeStage3;

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
let callMeStage4 = forwardStage2;
exports.output.callMeStage4 = callMeStage4;

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
    forwardingNumber = getPhoneNumber(env, params),
    timeout = getTimeout(env, params),
    whisperUrl = getWhisperUrl(params);

  callMeStage4(response, isDialDone(env,params), callStatus, fallbackUrl) ||
  callMeStage3(response, digits) ||
  (isWhisper(env, params)?
    callMeStage2(response, humanCheckRequired, message, language, voice):
    callMeStage1(response, forwardingNumber, timeout, whisperUrl, fallbackUrl)
  );

  reply(NO_ERROR, response);
};
