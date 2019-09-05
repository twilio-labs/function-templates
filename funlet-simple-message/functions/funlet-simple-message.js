/*
  Simple Message Funlet

  Description:
    Play one or several messages from recordings in MP3 format or through
    speech-to-text synthesis in a choice of languages and voices.

    This is an upgrade of the Simple Message Twimlet [1].
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
  // a list of one or several text string messages,
  // each being a recording URL or a text to say.
  messages: [""],

  // language code for conversion of text-to-speech messages,
  // e.g. 'en' or 'en-gb'
  language: "en",

  // voice for text-to-speech messages, one of 'man', 'woman' or 'alice'
  voice: "alice"
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

/*
  Function: readListParam()
  Read a list parameter split between a string or array under the base name,
  e.g. 'Message', and a list of separate values under the same name followed
  with an index, e.g. 'Message[0]', 'Message[1]', 'Message[2]'.

  Indexes are generally expected to start at 0 and grow sequentially,
  but this is not necessary and non-sequential indexes are also supported.

  Parameters:
    * name - string, name of the list parameter
    * params - object, hash of parameters

  Returns:
    array, the list of values found for the parameter,
    starting with values of indexed parameters, which may be
    sparse when indexes do not start at zero or are not sequential,
    followed with the string value or the list of values
    found under the base name.
    An empty array is returned when no value is found.
*/
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

function getMessages(params, env, config) {
  if ( params.hasOwnProperty("Message") ) {
    if ( typeof params.Message === "string" ) {
      return [params.Message];
    }
    return params.Message;
  }
  if (
    env.hasOwnProperty("FUNLET_MESSAGE1") ||
    env.hasOwnProperty("FUNLET_MESSAGE2") ||
    env.hasOwnProperty("FUNLET_MESSAGE3") ||
    env.hasOwnProperty("FUNLET_MESSAGE4") ||
    env.hasOwnProperty("FUNLET_MESSAGE5")
  ) {
    return [
      env.FUNLET_MESSAGE1,
      env.FUNLET_MESSAGE2,
      env.FUNLET_MESSAGE3,
      env.FUNLET_MESSAGE4,
      env.FUNLET_MESSAGE5
    ].filter( message => typeof message === "string" );
  }
  return config.messages;
}

function getLanguage(params, env, config) {
  return params.Language || env.FUNLET_MESSAGE_LANGUAGE || config.language;
}

function getVoice(params, env, config) {
  return params.Voice || env.FUNLET_MESSAGE_VOICE || config.voice;
}

/*
  3. Output Helpers

  These helper functions build part of the output.

  This is where you can fine-tune the TwiML elements and attributes
  produced in response to each stage of the Funlet.
*/

/*
  Function: simpleMessage()

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

  Response:
    The input response is modified with further instructions to Play or Say
    the given message. The input response is returned unchanged when the
    given message is empty.
*/
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
  Function: simpleMessages()

  Parameters:
    * response - Twilio.twiml.VoiceResponse, Twilio Voice response in progress
    * messages - array of string, list of messages, either recorded messages
                 (URL starting with 'http') to play or text message to say
    * language - string, language for text messages, e.g. 'en' for English
                 with an American accent or 'en-gb' for English with a British
                 accent. Use the voice 'alice' for the largest list of
                 supported languages and accents.
    * voice - string, voice for text messages,
              one of 'man', 'woman' or 'alice'.

  Response:
    The input response is modified with further instructions to Play or Say
    each message. The input response is returned unchanged when the
    list of messages is empty.
*/
function simpleMessages(response, messages, language, voice) {
  messages.forEach(
    message => simpleMessage(response, message, language, voice)
  );
}

/*
  4. Main Handler

  This is the entry point to your Twilio Function,
  which will run to process an incoming HTTP request
  such as the ones generated by Twilio events.
*/

exports.handler = function(context, event, callback) {
  const NO_ERROR = null;
  let response = new Twilio.twiml.VoiceResponse();
  simpleMessages(
    response,
    getMessages(event, context, config),
    getLanguage(event, context, config),
    getVoice(event, context, config)
  );
  callback(NO_ERROR, response);
};

/*
  5. Other Exports

  These internal features are exported too, for the purpose of unit tests.
*/

exports.config = config;

exports.input = {
  readListParam: readListParam,
  getMessages: getMessages,
  getLanguage: getLanguage,
  getVoice: getVoice
};

exports.output = {
  simpleMessage: simpleMessage,
  simpleMessages: simpleMessages
};

/*
  6. References

    [1] Simple Message Twimlet
    https://www.twilio.com/labs/twimlets/message

    [2] Simple Message Funlet
    https://github.com/twilio-labs/function-templates
                                  /tree/master/funlet-simple-message

    [3] Simple Message Funlet: Discussion
    https://github.com/twilio-labs/function-templates/issues/16
*/
