/*
  Whisper Funlet

  Description:
    Say a message and optionally request to press a digit (stage 1)
    to check that the recipient is human, and not a voicemail;
    if the check is requested and no digits are pressed, hang up.
    If digits are pressed (stage 2), bridge the call.

    This is an upgrade of the undocumented Whisper Twimlet.
    Designed to be backward-compatible with the Twimlet, it was
    extended to offer better support for internationalization.

  Contents:
    1. Configuration
    2. Input Parameters
    3. Output Helpers
    4. Main Handler
    5. Other Exports
    6. References
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
  humanCheck: false
};

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

function getMessage(params, env, config) {
  const caller = params.From || params.Caller || "";
  return params.Message ||
    env.FUNLET_WHISPER_MESSAGE ||
    ( typeof config.message === "function"?
        config.message( spell(caller) ):
        config.message
    );
}

function getLanguage(params, env, config) {
  return params.Language || env.FUNLET_WHISPER_LANGUAGE || config.language;
}

function getVoice(params, env, config) {
  return params.Voice || env.FUNLET_WHISPER_VOICE || config.voice;
}

function isHumanCheckRequired(params, env, config) {
  if ( typeof params.HumanCheck === "string" ) {
    return params.HumanCheck !== "false";
  }
  if ( typeof env.FUNLET_WHISPER_HUMAN_CHECK === "string" ) {
    return env.FUNLET_WHISPER_HUMAN_CHECK !== "false";
  }
  return config.humanCheck;
}

function getDigits(params, env, config) {
  if ( typeof params.Digits === "string" ) {
   return params.Digits;
  }
  return null;
}

/*
  3. Output Helpers

  These helper functions build part of the output.

  This is where you can fine-tune the TwiML elements and attributes
  produced in response to each stage of the Funlet.
*/

/*
  Function: spell()
  Spell a phone number digit by digit

  Parameter:
    numberString - string, phone number to spell

  Returns:
    string, the original phone number with each digit followed with a pause
    (marked as '. ' for text-to-speech synthesis)
*/
function spell( numberString ) {
  const PAUSE = '. ';
  return numberString.split('').join(PAUSE)+PAUSE;
}

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

// Copied from Simple Menu Funlet
function gatherDigits(response, maxDigits, message, language, voice) {
  simpleMessage(
    response.gather({numDigits: maxDigits}),
    message,
    language,
    voice
  );
}

/*
  Function: sendWhisperMessage()

  Parameters:
    * response - Twilio.twiml.VoiceResponse, Twilio Voice response in progress
    * humanCheck - boolean, whether to request the recipient to press a key
                   to accept the call explicitly
    * message - string, recorded message (URL starting with 'http') to play
                or text message to say
    * language - string, language for text messages, e.g. 'en' for English
                 with an American accent or 'en-gb' for English with a British
                 accent. Use the voice 'alice' for the largest list of
                 supported languages and accents.
    * voice - string, voice for text messages,
              one of 'man', 'woman' or 'alice'.

  Response:
    The input response is modified with instructions to gather one digit and,
    when a human check is requested, to hang up if no digits have been pressed.
*/
function sendWhisperMessage(response, humanCheck, message, language, voice) {
  gatherDigits(response, 1, message, language, voice);
  if ( humanCheck ) {
    response.hangup();
  }
}

/*
  Function: checkDigitsEntered()

  Parameters:
    * response - Twilio.twiml.VoiceResponse, Twilio Voice response in progress
    * digits - string of digits gathered, or null when no digits have been set

  Response:
    The input response is modified with instructions to hang up when an empty
    string of digits has been provided. This is a corner case, which is not
    expected to happen in recent version versions of the Twilio API but has
    been preserved for compatibility with the behavior of the original Twimlet.
    When a digit has been pressed, or when digits have not been set, the
    response is left unchanged.

  Returns:
    boolean, whether digits have been set
*/
function checkDigitsEntered(response, digits) {
  if ( digits === null ) {
    return false;
  }
  if ( digits==="" ) {
    response.hangup();
  }
  return true;
}

/*
  4. Main Handler

  This is the entry point to your Twilio Function,
  which will run to process an incoming HTTP request
  such as the ones generated by Twilio events.
*/

exports.handler = function(context, event, callback) {
  const NO_ERROR = null;

  let
    response = new Twilio.twiml.VoiceResponse(),
    digits = getDigits(event, context, config),
    humanCheckRequired = isHumanCheckRequired(event, context, config),
    message = getMessage(event, context, config),
    language = getLanguage(event, context, config),
    voice = getVoice(event, context, config);

  if (digits === null) {
    sendWhisperMessage(response, humanCheckRequired, message, language, voice);
  } else {
    checkDigitsEntered(response, digits);
  }
  callback(NO_ERROR, response);
};

/*
  5. Other Exports

  These internal features are exported too, for the purpose of unit tests.
*/

exports.config = config;

exports.input = {
  getMessage: getMessage,
  getLanguage: getLanguage,
  getVoice: getVoice,
  isHumanCheckRequired: isHumanCheckRequired,
  getDigits: getDigits
};

exports.output = {
  spell: spell,
  sendWhisperMessage: sendWhisperMessage,
  checkDigitsEntered: checkDigitsEntered
};

/*
  6. References

    [1] Whisper Funlet
    https://github.com/twilio-labs/function-templates
                                  /tree/master/funlet-whisper

    [2] Whisper Funlet: Discussion
    https://github.com/twilio-labs/function-templates/issues/12
*/
