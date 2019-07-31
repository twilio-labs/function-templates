// # Simple Menu Funlet
// Ask the caller to select an option in a menu (stage 1)
// then gather digits pressed and redirect to a new URL/Funlet (stage 2)

// ## Script Parameters

// a recording URL or a text to say to invite the caller to select an option
const MY_MESSAGE = "";

// error message (recording URL or text)
// played when the digits pressed do not match any option
const MY_ERROR_MESSAGE = "I'm sorry, that wasn't a valid option.";

// language code for conversion of text-to-speech messages,
// e.g. 'en' or 'en-gb'
const MY_LANGUAGE = "en";

// voice for text-to-speech messages, one of 'man', 'woman' or 'alice'
const MY_VOICE = "alice";

// hash of key -> value for options where:
// - the key is a string of digits
// - the value is the action URL for the option matching given digits.
// For example:
// {
//   "1": "https://example.com/option/1",
//   "2": "..."
// }
const MY_OPTIONS = {};

// ## Input
exports.input = {};

function getMessage(env, params) {
  return params.Message || env.FUNLET_MENU_MESSAGE || MY_MESSAGE;
}
exports.input.getMessage = getMessage;

function getErrorMessage(env, params) {
  return params.ErrorMessage ||
         env.FUNLET_MENU_ERROR_MESSAGE ||
         MY_ERROR_MESSAGE;
}
exports.input.getErrorMessage = getErrorMessage;

function getLanguage(env, params) {
  return params.Language || env.FUNLET_MENU_LANGUAGE || MY_LANGUAGE;
}
exports.input.getLanguage = getLanguage;

function getVoice(env, params) {
  return params.Voice || env.FUNLET_MENU_VOICE || MY_VOICE;
}
exports.input.getVoice = getVoice;

function getOptions(env, params) {
  let options = {};
  switch( typeof params.Options ) {
    case "string":
      options["0"] = params.Options;
      break;
    case "object":
      let objectOrArray = params.Options;
      for( let name of Object.keys(objectOrArray) ) {
        if ( !isNaN( name ) ) {
          options[ name ] = objectOrArray[ name ];
        }
      }
      break;
  }
  for( let name of Object.keys(params) ) {
    let matches = /^Options\[([0-9]+)\]$/.exec( name );
    if( matches !== null ) {
      let digits = matches[1];
      options[ digits ] = params[ name ];
    }
  }
  for( let name of Object.keys(env) ) {
    let matches = /^FUNLET_MENU_OPTION([0-9]+)_URL$/.exec( name );
    if( matches !== null ) {
      let optionNumber = matches[1];
      let digits = env[ "FUNLET_MENU_OPTION" + optionNumber + "_DIGITS" ]
      digits = digits || optionNumber;
      options[ digits ] = env[ name ];
    }
  }
  return options;
}
exports.input.getOptions = getOptions;

function getDigits(env, params) {
  if (typeof params.Digits === "string") {
    return params.Digits;
  }
  return "";
}
exports.input.getDigits = getDigits;

// ## Dependencies
const Twilio = require('twilio');

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
  Function: gatherDigits()

  Parameters:
    * response - Twilio.twiml.VoiceResponse, Twilio Voice response in progress
    * maxDigits - number, maximum number of digits to gather
    * message - string, recorded message (URL starting with 'http') to play
                or text message to say
    * language - string, language for text messages, e.g. 'en' for English
                 with an American accent or 'en-gb' for English with a British
                 accent. Use the voice 'alice' for the largest list of
                 supported languages and accents.
    * voice - string, voice for text messages,
              one of 'man', 'woman' or 'alice'.

  Response:
    The input response is modified with instructions to gather at most the
    given number of digits and send them to a new instance of this script.
*/
function gatherDigits(response, maxDigits, message, language, voice) {
  simpleMessage(
    response.gather({numDigits: maxDigits}),
    message,
    language,
    voice
  );
}
exports.output.gatherDigits = gatherDigits;

/*
  Function: simpleMenuStage1()

  Parameters:
    * response - Twilio.twiml.VoiceResponse, Twilio Voice response in progress
    * message - string, recorded message (URL starting with 'http') to play
                or text message to say
    * language - string, language for text messages, e.g. 'en' for English
                 with an American accent or 'en-gb' for English with a British
                 accent. Use the voice 'alice' for the largest list of
                 supported languages and accents.
    * voice - string, voice for text messages,
              one of 'man', 'woman' or 'alice'.
    * options - hash of digits -> URL associating digits pressed with the
                URL of a script returning TwiML instructions for that option

  Response:
    The input response is modified with instructions to gather at most
    the maximum number of digits present in given options, and start a
    new instance of this script, whether any digits were gathered or not.
*/
function simpleMenuStage1(response, message, language, voice, options) {
  let maxDigits = 1;
  for( let digits of Object.keys(options) ) {
    maxDigits = Math.max(maxDigits, digits.length);
  }
  gatherDigits(response, maxDigits, message, language, voice);
  response.redirect({},"");
}
exports.output.simpleMenuStage1 = simpleMenuStage1;

/*
  Function: simpleMenuStage2()

  Parameters:
    * response - Twilio.twiml.VoiceResponse, Twilio Voice response in progress
    * digits - string of digits gathered
    * options - hash of digits -> URL associating digits pressed with the
                URL of a script returning TwiML instructions for that option
    * errorMessage - string, recorded message (URL starting with 'http') to
                     play or text message to say in case the digits pressed
                     do not match one of the options
    * language - string, language for text messages, e.g. 'en' for English
                 with an American accent or 'en-gb' for English with a British
                 accent. Use the voice 'alice' for the largest list of
                 supported languages and accents.
    * voice - string, voice for text messages,
              one of 'man', 'woman' or 'alice'.

  Response:
    The input response is modified with instructions to redirect to the
    URL of the option matching the given digits, if any, or to say an error
    message. If no digits have been pressed, the response is left unchanged.

  Returns:
    boolean, true if a matching option was found, and false otherwise
*/
function simpleMenuStage2(
  response, digits, options, errorMessage, language, voice
) {
  if ( digits === "" ) {
    return false;
  }
  if ( !options.hasOwnProperty(digits) ) {
    simpleMessage(response, errorMessage, language, voice);
    return false;
  }
  let optionUrl = options[ digits ];
  response.redirect({}, optionUrl);
  return true;
}
exports.output.simpleMenuStage2 = simpleMenuStage2;

exports.handler = function(env, params, reply) {
  const NO_ERROR = null;

  let
    response = new Twilio.twiml.VoiceResponse(),
    digits = getDigits(env, params),
    message = getMessage(env, params),
    errorMessage = getErrorMessage(env, params),
    language = getLanguage(env, params),
    voice = getVoice(env, params),
    options = getOptions(env, params);

  if (
    ! simpleMenuStage2(
      response, digits, options, errorMessage, language, voice
    )
  ) {
    simpleMenuStage1(response, message, language, voice, options);
  }
  reply(NO_ERROR, response);
};
