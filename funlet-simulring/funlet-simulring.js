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

  if ( typeof params.PhoneNumbers === "object" ) { // actually an array
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
    return params.HumanCheck === "true";
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

exports.handler = function(env, params, reply) {
  const NO_ERROR = null;
  throw Error("Not implemented!");
  reply(NO_ERROR, 'response');
};
