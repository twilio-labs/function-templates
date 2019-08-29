/*
  Call Me Funlet

  Description:
    Forward the call to your forwarding number (stage 1)
    then hang up, or if the call failed, redirect the caller
    to a fallback URL/Funlet (stage 2).

    This is an upgrade of the Call Me Twimlet [1].
    Designed to be backward-compatible with the Twimlet, it was
    extended to offer better support for internationalization.

  Contents:
    1. Configuration
    2. Input Parameters
    3. Output Helpers
    4. Main Handler
    5. References
*/

/*
  1. Configuration

  Here you can change values for the input parameters,
  directly in the script.

  These values will be superseded by HTTP parameters and properties
  defined in the environment. You can customize the names and priorities
  of these various parameters in the next section: Input Parameters.
*/

let config = {
  // the forwarding number
  phoneNumber: "",

  // duration in seconds to let the call ring before the recipient picks up
  timeout: 20,

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
  humanCheck: false,

  // fallback URL where further instructions are requested
  // when the forwarding call fails
  fallbackUrl: ""
};
exports.config = config;

/*
  2. Input Parameters

  Each input parameter Foo is read by a separate function getFoo()
  which takes one parameter for each source:

    * params - object, the set of HTTP parameters
               from the URL (GET) or the body (POST) of the query
    * env - object, the set of environment properties
            defined in the Twilio account
    * config - object, the configuration object
               defined above in this script

  The HTTP parameters are considered first, then environment properties,
  then the script parameters. This can be customized in the functions below.
*/
exports.input = {};

function getPhoneNumber(params, env, config) {
  return params.PhoneNumber ||
    env.FUNLET_CALLME_PHONE_NUMBER ||
    config.phoneNumber;
}
exports.input.getPhoneNumber = getPhoneNumber;

function getTimeout(params, env, config) {
  let timeout = params.Timeout || env.FUNLET_CALLME_TIMEOUT;
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
    env.FUNLET_CALLME_MESSAGE ||
    (
      typeof config.message==="function"?
        config.message( spell(caller) ):
        config.message
    );
}
exports.input.getMessage = getMessage;

function getLanguage(params, env, config) {
  return params.Language || env.FUNLET_CALLME_LANGUAGE || config.language;
}
exports.input.getLanguage = getLanguage;

function getVoice(params, env, config) {
  return params.Voice || env.FUNLET_CALLME_VOICE || config.voice;
}
exports.input.getVoice = getVoice;

function isHumanCheckRequired(params, env, config) {
  if ( typeof params.HumanCheck === "string" ) {
    return params.HumanCheck !== "false";
  }
  if ( typeof env.FUNLET_CALLME_HUMAN_CHECK === "string" ) {
    return env.FUNLET_CALLME_HUMAN_CHECK !== "false";
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
    env.FUNLET_CALLME_FALLBACK_URL ||
    config.fallbackUrl;
}
exports.input.getFallbackUrl = getFallbackUrl;

/*
  3. Output Helpers

  These helper functions build part of the output.

  This is where you can fine-tune the TwiML elements and attributes
  produced in response to each stage of the Funlet.
*/
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
  copyStringParam( "HumanCheck" );

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

/*
  4. Main Handler

  This is the entry point to your Twilio Function,
  which will run to process an incoming HTTP request
  such as the ones generated by Twilio events.
*/

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
    forwardingNumber = getPhoneNumber(params, env, config),
    timeout = getTimeout(params, env, config),
    whisperUrl = getWhisperUrl(params);

  callMeStage4( response, isDial, callStatus, fallbackUrl ) ||
  callMeStage3(response, digits) ||
  (isWhisper(params, env, config)?
    callMeStage2(response, humanCheckRequired, message, language, voice):
    callMeStage1(response, forwardingNumber, timeout, whisperUrl, fallbackUrl)
  );

  reply(NO_ERROR, response);
};

/*
  5. References

    [1] Call Me Twimlet
    https://www.twilio.com/labs/twimlets/callme

    [2] Call Me Funlet
    https://github.com/twilio-labs/function-templates
                                  /tree/master/funlet-call-me

    [3] Call Me Funlet: Discussion
    https://github.com/twilio-labs/function-templates/issues/17
*/
