// # Forward Funlet
// Forward the call to a forwarding number, optionally checking that
// the caller is on a white list of allowed numbers (stage 1).
// When the forwarding call ends (stage 2), hang up if it was successful
// or redirect to the fallback URL/Funlet, if any.

// ## Script Parameters

// the forwarding number
const MY_PHONE_NUMBER="";

// one of the verified phone numbers of your account
// that you want to appear as caller ID for the forwarded call
const MY_CALLER_ID="";

// fallback URL where further instructions are requested
// when the forwarding call fails
const MY_FALLBACK_URL="";

// duration in seconds to let the call ring before the recipient picks up
const MY_TIMEOUT=20;

// list of text strings with the only phone numbers of callers that will be
// allowed to be forwarded. When the list is empty, all numbers are allowed.
const MY_ALLOWED_CALLERS=[];

// recording URL or a text to say
// when the calling number is not one of the allowed callers configured
const MY_ACCESS_RESTRICTED=
  "Sorry, you are calling from a restricted number. Good bye.";

// language code for text messages, e.g. 'en' or 'en-gb'
const MY_LANGUAGE="en";

// voice for text messages, one of 'man', 'woman' or 'alice'
const MY_VOICE="alice";

// ## Input
exports.input = {};

function getPhoneNumber(env, params) {
  return params.PhoneNumber ||
    env.FUNLET_FORWARD_PHONE_NUMBER ||
    MY_PHONE_NUMBER;
}
exports.input.getPhoneNumber = getPhoneNumber;

function getCallerId(env, params) {
  return params.CallerId ||
    env.FUNLET_FORWARD_CALLER_ID ||
    MY_CALLER_ID;
}
exports.input.getCallerId = getCallerId;

function getFallbackUrl(env, params) {
  return params.FailUrl ||
    env.FUNLET_FORWARD_FALLBACK_URL ||
    MY_FALLBACK_URL;
}
exports.input.getFallbackUrl = getFallbackUrl;

function getTimeout(env, params) {
  let timeout = params.Timeout || env.FUNLET_FORWARD_TIMEOUT;
  if ( typeof timeout === "string" && !isNaN(timeout) ) {
    return Number(timeout);
  }
  return MY_TIMEOUT;
}
exports.input.getTimeout = getTimeout;

function getAllowedCallers(env, params) {
  let allowedCallers = [];

  function formatNumber( phoneNumber ) {
    let digitsOnly = phoneNumber.replace(/[^0-9]/g,"");
    if (
      params.ApiVersion === "2008-08-01" &&
      digitsOnly.length === 11 &&
      digitsOnly[0]==='1'
    ) {
      return digitsOnly.slice(1);
    }
    return digitsOnly;
  }

  function addIfNotEmpty( phoneNumber ) {
    if ( typeof phoneNumber === "string" && phoneNumber !== "" ) {
      allowedCallers.push( formatNumber(phoneNumber) );
    }
  }

  if ( typeof params.AllowedCallers === "object" ) { // actually an array
    params.AllowedCallers.forEach(
      phoneNumber => addIfNotEmpty(phoneNumber)
    );
  } else {
    addIfNotEmpty( params.AllowedCallers );
  }

  addIfNotEmpty( env.FUNLET_FORWARD_ALLOWED_CALLER1 );
  addIfNotEmpty( env.FUNLET_FORWARD_ALLOWED_CALLER2 );
  addIfNotEmpty( env.FUNLET_FORWARD_ALLOWED_CALLER3 );
  addIfNotEmpty( env.FUNLET_FORWARD_ALLOWED_CALLER4 );
  addIfNotEmpty( env.FUNLET_FORWARD_ALLOWED_CALLER5 );

  MY_ALLOWED_CALLERS.forEach(
    phoneNumber => addIfNotEmpty(phoneNumber)
  );

  return allowedCallers;
}
exports.input.getAllowedCallers = getAllowedCallers;

function getAccessRestrictedErrorMessage(env, params) {
  return params.AccessRestricted ||
    env.FUNLET_FORWARD_ACCESS_RESTRICTED ||
    MY_ACCESS_RESTRICTED;
}
exports.input.getAccessRestrictedErrorMessage =
  getAccessRestrictedErrorMessage;

function getLanguage(env, params) {
  return params.Language || env.FUNLET_FORWARD_LANGUAGE || MY_LANGUAGE;
}
exports.input.getLanguage = getLanguage;

function getVoice(env, params) {
  return params.Voice || env.FUNLET_FORWARD_VOICE || MY_VOICE;
}
exports.input.getVoice = getVoice;

function getCaller(env, params) {
  return params.From || params.Caller;
}
exports.input.getCaller = getCaller;

function getPhoneNumberCalled(env, params) {
  return params.To || params.Called;
}
exports.input.getPhoneNumberCalled = getPhoneNumberCalled;

function isDialDone(env, params) {
  return (typeof params.Dial === "string" );
}
exports.input.isDialDone = isDialDone;

function getCallStatus(env, params) {
  const NO_CALL_STATUS = "";
  return params.DialStatus || params.DialCallStatus || NO_CALL_STATUS;
}
exports.input.getCallStatus = getCallStatus;

// ## Dependencies
const Twilio = require('twilio');

// ## Utilities
exports.utils = {};

/*
  Function: isForwardingAllowed()

  Parameters:
    caller - string of digits, phone number of the caller (digits only)
    called - string of digits, Twilio phone number called (digits only)
    allowedCallers - array of strings of digits, list of allowed callers;
                     an empty list means that all callers are allowed.
  Returns:
    true when:
      - the list of allowed callers is empty
      - or the given caller is found in the list,
      - or the called number is found in the list
        (the reason for this last condition is unclear,
        it was kept for compatibility with the original Twimlet)
    false otherwise.
*/
function isForwardingAllowed(caller, called, allowedCallers) {
  if ( allowedCallers.length === 0 ) {
    return true;
  }
  return allowedCallers.includes(caller) || allowedCallers.includes(called);
}
exports.utils.isForwardingAllowed = isForwardingAllowed;

// ## Output
exports.output = {};

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

/*
  Function: forwardStage1()

  Parameters:
    * response - Twilio.twiml.VoiceResponse, Twilio Voice response in progress
    * isForwardingAllowed - boolean, whether forwarding is permitted to
                            this caller
    * accessRestrictedErrorMessage - string, recorded message (URL starting
                with 'http') to play or text message to say in case forwarding
                is not permitted to the caller
    * language - string, language for text messages, e.g. 'en' for English
                 with an American accent or 'en-gb' for English with a British
                 accent. Use the voice 'alice' for the largest list of
                 supported languages and accents.
    * voice - string, voice for text messages,
              one of 'man', 'woman' or 'alice'.
    * callerId - string, verified phone number to use as caller Id
                 for the forwarded call
    * forwardingNumber - string, the forwarding number
    * timeout - number, duration in seconds to let the forwarding call ring
                before the recipient picks up
    * fallbackUrl - string, URL of a script with further instructions
                    in case the forwarding call fails
  Response:
    When the caller is allowed, the input response is modified with
    instructions to forward the call to the given forwarding number,
    with given caller ID and timeout, and to redirect to the given
    fallback URL if the forwarding call fails.
    When the caller is a restricted number, the response is modified
    to play or say an error message instead.
*/
function forwardStage1(
  response,
  isForwardingAllowed, accessRestrictedErrorMessage, language, voice,
  callerId, forwardingNumber, timeout, fallbackUrl
) {
  if ( !isForwardingAllowed ) {
    simpleMessage(response, accessRestrictedErrorMessage, language, voice)
    return;
  }
  const BASE_URL = ".";
  let actionUrl = BASE_URL + "?Dial=true";
  if ( fallbackUrl !== "" ) {
    actionUrl += "&" + encodeURIComponent(fallbackUrl);
  }
  let dialOptions = {
    action: actionUrl,
  };
  if ( callerId !== "" ) {
    dialOptions.callerId = callerId;
  }
  dialOptions.timeout = timeout;
  response.dial( dialOptions, forwardingNumber );
}
exports.output.forwardStage1 = forwardStage1;

/*
  Function: forwardStage2()

  Parameters:
    * response - Twilio.twiml.VoiceResponse, Twilio Voice response in progress
    * isDialDone - boolean, whether the forwarding call has completed
    * callStatus - string, the status of the forwarding call
    * fallbackUrl - string, URL of a script with further instructions
                    in case the forwarding call failed
  Response:
    Until the forwarding call has completed, the response is left unchanged.
    When the forwarding call has ended in a failure, the response is modified
    with instructions to redirect to the fallback URL, if any. Otherwise,
    an instruction to hang up is added to the response.

  Returns:
    true when the forwarding call has completed,
    false otherwise.
*/
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
exports.output.forwardStage2 = forwardStage2;

exports.handler = function(env, params, reply) {
  const NO_ERROR = null;

  let
    response = new Twilio.twiml.VoiceResponse(),
    callStatus = getCallStatus(env, params),
    fallbackUrl = getFallbackUrl(env, params),
    caller = getCaller(env, params),
    called = getPhoneNumberCalled(env, params),
    allowedCallers = getAllowedCallers(env, params),
    accessRestrictedErrorMessage =
      getAccessRestrictedErrorMessage(env, params),
    language = getLanguage(env, params),
    voice = getVoice(env, params),
    callerId = getCallerId(env, params),
    forwardingNumber = getPhoneNumber(env, params),
    timeout = getTimeout(env, params);

  if (
    !forwardStage2(
      response, isDialDone(env,params), callStatus, fallbackUrl
    )
  ) {
    forwardStage1(
      response,
      isForwardingAllowed(caller, called, allowedCallers),
      accessRestrictedErrorMessage, language, voice,
      callerId, forwardingNumber, timeout, fallbackUrl
    );
  }

  reply(NO_ERROR, response);
};
