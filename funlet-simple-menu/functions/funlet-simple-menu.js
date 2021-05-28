/*
  Simple Menu Funlet

  Description:
    Ask the caller to select an option in a menu (stage 1)
    then gather digits pressed and redirect to a new URL/Funlet (stage 2)

    This is an upgrade of the Simple Menu Twimlet [1].
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
  // a recording URL or a text to say to invite the caller to select an option
  message: '',

  // error message (recording URL or text)
  // played when the digits pressed do not match any option
  errorMessage: "I'm sorry, that wasn't a valid option.",

  // language code for conversion of text-to-speech messages,
  // e.g. 'en' or 'en-gb'
  language: 'en',

  // voice for text-to-speech messages, one of 'man', 'woman' or 'alice'
  voice: 'alice',

  // hash of key -> value for options where:
  // - the key is a string of digits
  // - the value is the action URL for the option matching given digits.
  // For example:
  // {
  //   "1": "https://example.com/option/1",
  //   "2": "..."
  // }
  options: {},
};

/*
  2. Input Utilities

  These utility functions help in reading input parameters.
*/

// Copied from Simple Message Funlet
function readListParam(name, params) {
  let array = [];

  const INDEXED_PARAM_REGEX = new RegExp('^' + name + '\\[([0-9]+)\\]$');
  for (let property of Object.keys(params)) {
    let matches = INDEXED_PARAM_REGEX.exec(property);
    if (matches !== null) {
      let index = matches[1];
      array[index] = params[property];
    }
  }

  if (params.hasOwnProperty(name)) {
    let value = params[name];
    if (typeof value === 'string') {
      array.push(value);
    } else if (Array.isArray(value)) {
      array = array.concat(value);
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

function getMessage(params, env, config) {
  return params.Message || env.FUNLET_MENU_MESSAGE || config.message;
}

function getErrorMessage(params, env, config) {
  return (
    params.ErrorMessage || env.FUNLET_MENU_ERROR_MESSAGE || config.errorMessage
  );
}

function getLanguage(params, env, config) {
  return params.Language || env.FUNLET_MENU_LANGUAGE || config.language;
}

function getVoice(params, env, config) {
  return params.Voice || env.FUNLET_MENU_VOICE || config.voice;
}

function getOptions(params, env, config) {
  let options = Object.assign({}, config.options);

  for (let name of Object.keys(env)) {
    let matches = /^FUNLET_MENU_OPTION([0-9]+)_URL$/.exec(name);
    if (matches !== null) {
      let optionNumber = matches[1];
      let digits = env['FUNLET_MENU_OPTION' + optionNumber + '_DIGITS'];
      digits = digits || optionNumber;
      options[digits] = env[name];
    }
  }

  Object.assign(options, readListParam('Options', params));
  return options;
}

function getDigits(params, env, config) {
  return params.Digits || '';
}

/*
  4. Output Helpers

  These helper functions build part of the output.

  This is where you can fine-tune the TwiML elements and attributes
  produced in response to each stage of the Funlet.
*/

// Copied from Simple Message Funlet
function simpleMessage(response, message, language, voice) {
  if (message.length === 0) {
    return;
  }
  if (message.startsWith('http')) {
    response.play({}, message);
  } else {
    response.say({ language: language, voice: voice }, message);
  }
}

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
    response.gather({ numDigits: maxDigits }),
    message,
    language,
    voice
  );
}

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
  for (let digits of Object.keys(options)) {
    maxDigits = Math.max(maxDigits, digits.length);
  }
  gatherDigits(response, maxDigits, message, language, voice);
  response.redirect({}, '');
}

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
  response,
  digits,
  options,
  errorMessage,
  language,
  voice
) {
  if (digits === '') {
    return false;
  }
  if (!options.hasOwnProperty(digits)) {
    simpleMessage(response, errorMessage, language, voice);
    return false;
  }
  let optionUrl = options[digits];
  response.redirect({}, optionUrl);
  return true;
}

/*
  5. Main Handler

  This is the entry point to your Twilio Function,
  which will run to process an incoming HTTP request
  such as the ones generated by Twilio events.
*/

exports.handler = function (context, event, callback) {
  const NO_ERROR = null;

  let response = new Twilio.twiml.VoiceResponse(),
    digits = getDigits(event, context, config),
    message = getMessage(event, context, config),
    errorMessage = getErrorMessage(event, context, config),
    language = getLanguage(event, context, config),
    voice = getVoice(event, context, config),
    options = getOptions(event, context, config);

  if (
    !simpleMenuStage2(response, digits, options, errorMessage, language, voice)
  ) {
    simpleMenuStage1(response, message, language, voice, options);
  }
  callback(NO_ERROR, response);
};

/*
  6. Other Exports

  These internal features are exported too, for the purpose of unit tests.
*/

exports.config = config;

exports.input = {
  getMessage: getMessage,
  getErrorMessage: getErrorMessage,
  getLanguage: getLanguage,
  getVoice: getVoice,
  getOptions: getOptions,
  getDigits: getDigits,
};

exports.output = {
  gatherDigits: gatherDigits,
  simpleMenuStage1: simpleMenuStage1,
  simpleMenuStage2: simpleMenuStage2,
};

/*
  7. References

    [1] Simple Menu Twimlet
    https://www.twilio.com/labs/twimlets/menu

    [2] Simple Menu Funlet
    https://github.com/twilio-labs/function-templates
                                  /tree/master/funlet-simple-menu

    [3] Simple Menu Funlet: Discussion
    https://github.com/twilio-labs/function-templates/issues/15
*/
