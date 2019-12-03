/*
  Forward Funlet

  Description:
    Forward the call to a forwarding number, optionally checking that
    the caller is on a white list of allowed numbers (stage 1).
    When the forwarding call ends (stage 2), hang up if it was successful
    or redirect to the fallback URL/Funlet, if any.

    This is an upgrade of the Forward Twimlet [1].
    Designed to be backward-compatible with the Twimlet, it was
    extended to offer better support for internationalization.

  Contents:
    1. Configuration
    2. Input Utilities
    3. Input Parameters
    4. Output Helpers
    5. Main Handler
    6. Other Exports
    7. References
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

  // one of the verified phone numbers of your account
  // that you want to appear as caller ID for the forwarded call
  callerId: "",

  // fallback URL where further instructions are requested
  // when the forwarding call fails
  fallbackUrl: "",

  // duration in seconds to let the call ring before the recipient picks up
  timeout: 20,

  // list of text strings with the only phone numbers of callers that will be
  // allowed to be forwarded. When the list is empty, all numbers are allowed.
  allowedCallers: [],

  // recording URL or a text to say
  // when the calling number is not one of the allowed callers configured
  accessRestricted:
    "Sorry, you are calling from a restricted number. Good bye.",

  // language code for text messages, e.g. 'en' or 'en-gb'
  language: "en",

  // voice for text messages, one of 'man', 'woman' or 'alice'
  voice: "alice"
};

/*
  2. Input Utilities

  These utility functions help in reading input parameters.
*/

// Copied from Simple Message Funlet
function readListParam( name, params ) {
  let array = [];

  const INDEXED_PARAM_REGEX = new RegExp( '^' + name + '\\[([0-9]+)\\]$' );
  for( let property of Object.keys(params) ) {
    let matches = INDEXED_PARAM_REGEX.exec( property );
    if( matches !== null ) {
      let index = matches[1];
      array[ index ] = params[ property ];
    }
  }

  if ( params.hasOwnProperty( name ) ) {
    let value = params[ name ];
    if ( typeof value === "string" ) {
      array.push( value );
    } else if ( Array.isArray( value ) ) {
      array = array.concat( value );
    }
  }

  return array;
}

// Copied from Simple Message Funlet
function readEnvList( name, start, end, env ) {
  let array = [];

  for ( let i=start; i<=end; i++ ) {
    let
      key = name + i,
      value = env[ key ];
    if ( typeof value === "string" ) {
      array.push( value );
    }
  }

  return array;
}

/*
  3. Input Parameters

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

function getPhoneNumber(params, env, config) {
  return params.PhoneNumber ||
    env.FUNLET_FORWARD_PHONE_NUMBER ||
    config.phoneNumber;
}

function getCallerId(params, env, config) {
  return params.CallerId ||
    env.FUNLET_FORWARD_CALLER_ID ||
    config.callerId;
}

function getFallbackUrl(params, env, config) {
  return params.FailUrl ||
    env.FUNLET_FORWARD_FALLBACK_URL ||
    config.fallbackUrl;
}

function getTimeout(params, env, config) {
  let timeout = params.Timeout || env.FUNLET_FORWARD_TIMEOUT;
  if ( typeof timeout === "string" && !isNaN(timeout) ) {
    return Number(timeout);
  }
  return config.timeout;
}

function getAllowedCallers(params, env, config) {
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

  readListParam( "AllowedCallers", params )
    .forEach( addIfNotEmpty );
  readEnvList( "FUNLET_FORWARD_ALLOWED_CALLER", 1, 5, env )
    .forEach( addIfNotEmpty );

  if ( Array.isArray(config.allowedCallers) ) {
    config.allowedCallers.forEach( addIfNotEmpty );
  }

  return allowedCallers;
}

function getAccessRestrictedErrorMessage(params, env, config) {
  return params.AccessRestricted ||
    env.FUNLET_FORWARD_ACCESS_RESTRICTED ||
    config.accessRestricted;
}

function getLanguage(params, env, config) {
  return params.Language || env.FUNLET_FORWARD_LANGUAGE || config.language;
}

function getVoice(params, env, config) {
  return params.Voice || env.FUNLET_FORWARD_VOICE || config.voice;
}

function getCaller(params, env, config) {
  return params.From || params.Caller;
}

function getPhoneNumberCalled(params, env, config) {
  return params.To || params.Called;
}

function isDialDone(params, env, config) {
  return (typeof params.Dial === "string" );
}

function getCallStatus(params, env, config) {
  const NO_CALL_STATUS = "";
  return params.DialStatus || params.DialCallStatus || NO_CALL_STATUS;
}

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

/*
  4. Output Helpers

  These helper functions build part of the output.

  This is where you can fine-tune the TwiML elements and attributes
  produced in response to each stage of the Funlet.
*/

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

/*
  Function: getForwardActionUrl()

  Parameter:
    fallbackUrl - string, URL of a script with further instructions
                  in case the forwarding call fails

  Returns:
    string, the action URL to get back to this script and redirect
    to the fallback URL, if any, when the forwarding call has failed.
*/
function getForwardActionUrl( fallbackUrl ) {
  const BASE_URL = ".";
  let actionUrl = BASE_URL + "?Dial=true";
  if ( fallbackUrl !== "" ) {
    actionUrl += "&" + encodeURIComponent(fallbackUrl);
  }
  return actionUrl;
}

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
  let dialOptions = {
    action: getForwardActionUrl( fallbackUrl ),
  };
  if ( callerId !== "" ) {
    dialOptions.callerId = callerId;
  }
  dialOptions.timeout = timeout;
  response.dial( dialOptions, forwardingNumber );
}

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

/*
  5. Main Handler

  This is the entry point to your Twilio Function,
  which will run to process an incoming HTTP request
  such as the ones generated by Twilio events.
*/

exports.handler = function(context, event, callback) {
  const NO_ERROR = null;

  let
    response = new Twilio.twiml.VoiceResponse(),
    isDial = isDialDone(event, context, config),
    callStatus = getCallStatus(event, context, config),
    fallbackUrl = getFallbackUrl(event, context, config),
    caller = getCaller(event, context, config),
    called = getPhoneNumberCalled(event, context, config),
    allowedCallers = getAllowedCallers(event, context, config),
    accessRestrictedErrorMessage =
      getAccessRestrictedErrorMessage(event, context, config),
    language = getLanguage(event, context, config),
    voice = getVoice(event, context, config),
    callerId = getCallerId(event, context, config),
    forwardingNumber = getPhoneNumber(event, context, config),
    timeout = getTimeout(event, context, config);

  if (
    !forwardStage2( response, isDial, callStatus, fallbackUrl )
  ) {
    forwardStage1(
      response,
      isForwardingAllowed(caller, called, allowedCallers),
      accessRestrictedErrorMessage, language, voice,
      callerId, forwardingNumber, timeout, fallbackUrl
    );
  }

  callback(NO_ERROR, response);
};

/*
  6. Other Exports

  These internal features are exported too, for the purpose of unit tests.
*/

exports.config = config;

exports.input = {
  getPhoneNumber: getPhoneNumber,
  getCallerId: getCallerId,
  getFallbackUrl: getFallbackUrl,
  getTimeout: getTimeout,
  getAllowedCallers: getAllowedCallers,
  getAccessRestrictedErrorMessage: getAccessRestrictedErrorMessage,
  getLanguage: getLanguage,
  getVoice: getVoice,
  getCaller: getCaller,
  getPhoneNumberCalled: getPhoneNumberCalled,
  isDialDone: isDialDone,
  getCallStatus: getCallStatus
};

exports.utils = {
  isForwardingAllowed: isForwardingAllowed
};

exports.output = {
  getForwardActionUrl: getForwardActionUrl,
  forwardStage1: forwardStage1,
  forwardStage2: forwardStage2
};

/*
  7. References

    [1] Forward Twimlet
    https://www.twilio.com/labs/twimlets/forward

    [2] Forward Funlet
    https://github.com/twilio-labs/function-templates
                                  /tree/master/funlet-forward

    [3] Forward Funlet: Discussion
    https://github.com/twilio-labs/function-templates/issues/10
*/
