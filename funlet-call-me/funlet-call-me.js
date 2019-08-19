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
    return params.HumanCheck === "true";
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

exports.handler = function(env, params, reply) {
  const NO_ERROR = null;
  throw Error("Not implemented!");
  reply(NO_ERROR, 'response');
};
