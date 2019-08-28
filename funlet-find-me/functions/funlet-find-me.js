// # Find Me Funlet
// Forward the call to one of up to 10 forwarding numbers,
// tried one by one (stage 1). After each call ends (stage 2),
// just hang up if the call was successful, or try forwarding
// to the next number (back to stage 1) until no forwarding numbers
// are left, then redirect to the fallback URL/Funlet, if any.

// ## Script Parameters

let config={
  // list of forwarding phone numbers
  phoneNumbers: [],

  // duration in seconds to let the call ring before the recipient picks up
  timeout: 60,

  // recording URL or text message to say,
  // e.g. asking the recipient to press a key to accept the call
  message: fromNumber =>
    `You are receiving a call from ${fromNumber}. Press any key to accept.`,

  // language code for conversion of text-to-speech messages,
  // e.g. 'en' or 'en-gb'
  language: "en",

  // voice for text-to-speech messages, one of 'man', 'woman' or 'alice'
  voice: "alice",

  // whether to request the recipient to press a key to accept the call
  humanCheck: true,

  // fallback URL where further instructions are requested
  // when the forwarding call fails
  fallbackUrl: ""
};
exports.config = config;

// ## Input
exports.input = {};

function getPhoneNumbers(params, env, config) {
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

  addIfNotEmpty( env.FUNLET_FINDME_PHONE_NUMBER1 );
  addIfNotEmpty( env.FUNLET_FINDME_PHONE_NUMBER2 );
  addIfNotEmpty( env.FUNLET_FINDME_PHONE_NUMBER3 );
  addIfNotEmpty( env.FUNLET_FINDME_PHONE_NUMBER4 );
  addIfNotEmpty( env.FUNLET_FINDME_PHONE_NUMBER5 );

  if ( Array.isArray(config.phoneNumbers) ) {
    config.phoneNumbers.forEach(
      phoneNumber => addIfNotEmpty(phoneNumber)
    );
  }

  return phoneNumbers;
}
exports.input.getPhoneNumbers = getPhoneNumbers;

function getTimeout(params, env, config) {
  let timeout = params.Timeout || env.FUNLET_FINDME_TIMEOUT;
  if ( typeof timeout === "string" && !isNaN(timeout) ) {
    return Number(timeout);
  }
  return config.timeout;
}
exports.input.getTimeout = getTimeout;

function isWhisper(params, env, config) {
  return ( typeof params.Whisper === "string" );
}
exports.input.isWhisper = isWhisper;

function getMessage(params, env, config) {
  const caller = params.From || params.Caller || "";
  return params.Message ||
    env.FUNLET_FINDME_MESSAGE ||
    ( typeof config.message === "function"?
        config.message( spell(caller) ):
        config.message
    );
}
exports.input.getMessage = getMessage;

function getLanguage(params, env, config) {
  return params.Language || env.FUNLET_FINDME_LANGUAGE || config.language;
}
exports.input.getLanguage = getLanguage;

function getVoice(params, env, config) {
  return params.Voice || env.FUNLET_FINDME_VOICE || config.voice;
}
exports.input.getVoice = getVoice;

function isHumanCheckRequired(params, env, config) {
  if ( typeof params.HumanCheck === "string" ) {
    return params.HumanCheck !== "false";
  }
  if ( typeof env.FUNLET_FINDME_HUMAN_CHECK === "string" ) {
    return env.FUNLET_FINDME_HUMAN_CHECK !== "false";
  }
  return config.humanCheck;
}
exports.input.isHumanCheckRequired = isHumanCheckRequired;

function getDigits(params, env, config) {
  if ( typeof params.Digits === "string" ) {
   return params.Digits;
  }
  return null;
}
exports.input.getDigits = getDigits;

function isDialDone(params, env, config) {
  return (typeof params.Dial === "string" );
}
exports.input.isDialDone = isDialDone;

// Copied from Forward Funlet
function getCallStatus(params, env, config) {
  const NO_CALL_STATUS = "";
  return params.DialStatus || params.DialCallStatus || NO_CALL_STATUS;
}
exports.input.getCallStatus = getCallStatus;

function getFallbackUrl(params, env, config) {
  return params.FailUrl ||
    env.FUNLET_FINDME_FALLBACK_URL ||
    config.fallbackUrl;
}
exports.input.getFallbackUrl = getFallbackUrl;

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
  copyStringParam( "HumanCheck" );

  return whisperUrl;
}
exports.output.getWhisperUrl = getWhisperUrl;

/*
  Function: findMeStage1()

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
      - forward the call to the first of the forwarding numbers,
        with given timeout,
      - to play a message asking the recipient to accept
        the call by pressing a key,
      - and to try again with the next forwarding number,
        if the forwarding call fails, or to redirect to the given
        fallback URL when the last forwarding number has been tried.
*/
function findMeStage1(
  response, forwardingNumbers, timeout, whisperUrl, fallbackUrl
) {
  let otherForwardingNumbers = Array.from(forwardingNumbers);
  let firstForwardingNumber = otherForwardingNumbers.shift();
  let actionUrl = getForwardActionUrl( fallbackUrl );
  otherForwardingNumbers.forEach( forwardingNumber =>
    actionUrl +=
      '&' +
      encodeURIComponent('PhoneNumbers[]') +
      '=' +
      encodeURIComponent( forwardingNumber )
  );

  let dial = response.dial({
    action: actionUrl,
    timeout: timeout
  });
  dial.number( {url:whisperUrl}, firstForwardingNumber );
}
exports.output.findMeStage1 = findMeStage1;

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
let findMeStage2 = whisperStage1;
exports.output.findMeStage2 = findMeStage2;

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
let findMeStage3 = whisperStage2;
exports.output.findMeStage3 = findMeStage3;

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
let findMeStage4 = forwardStage2;
exports.output.findMeStage4 = findMeStage4;

exports.handler = function(env, params, reply) {
  const NO_ERROR = null;

  let
    response = new Twilio.twiml.VoiceResponse(),
    isDial = isDialDone(params, env, config),
    callStatus = getCallStatus(params, env, config),
    fallbackUrl = getFallbackUrl(params, env, config),
    digits = getDigits(params, env, config),
    humanCheckRequired = isHumanCheckRequired(params, env, config),
    message = getMessage(params, env, config),
    language = getLanguage(params, env, config),
    voice = getVoice(params, env, config),
    forwardingNumbers = getPhoneNumbers(params, env, config),
    timeout = getTimeout(params, env, config),
    whisperUrl = getWhisperUrl(params);

  findMeStage4(response, isDial, callStatus, fallbackUrl) ||
  findMeStage3(response, digits) ||
  (isWhisper(params, env, config)?
    findMeStage2(response, humanCheckRequired, message, language, voice):
    findMeStage1(
      response, forwardingNumbers, timeout, whisperUrl, fallbackUrl
    )
  );

  reply(NO_ERROR, response);
};
