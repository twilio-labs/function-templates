// # Simple Message Funlet
// Play one or several messages from recordings in MP3 format or through
// speech-to-text synthesis in a choice of languages and voices.

// ## Script Parameters

let config={
  // a list of one or several text string messages,
  // each being a recording URL or a text to say.
  messages: [""],

  // language code for conversion of text-to-speech messages,
  // e.g. 'en' or 'en-gb'
  language: "en",

  // voice for text-to-speech messages, one of 'man', 'woman' or 'alice'
  voice: "alice"
};
exports.config = config;

// ## Input
exports.input = {};

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
exports.input.getMessages = getMessages;

function getLanguage(params, env, config) {
  return params.Language || env.FUNLET_MESSAGE_LANGUAGE || config.language;
}
exports.input.getLanguage = getLanguage;

function getVoice(params, env, config) {
  return params.Voice || env.FUNLET_MESSAGE_VOICE || config.voice;
}
exports.input.getVoice = getVoice;

// ## Output
exports.output = {};

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
exports.output.simpleMessage = simpleMessage;

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
exports.output.simpleMessages = simpleMessages;

exports.handler = function(env, params, reply) {
  const NO_ERROR = null;
  let response = new Twilio.twiml.VoiceResponse();
  simpleMessages(
    response,
    getMessages(params, env, config),
    getLanguage(params, env, config),
    getVoice(params, env, config)
  );
  reply(NO_ERROR, response);
};
