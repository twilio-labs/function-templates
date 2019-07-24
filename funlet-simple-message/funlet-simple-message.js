// # Simple Message Funlet

// ## Input
exports.input = {};

function getMessage(env, params) {
  const MY_MESSAGE = "";
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
  return [MY_MESSAGE];
}
exports.input.getMessage = getMessage;

// ## Dependencies
const Twilio = require('twilio');

// ## Output
exports.output = {};

/*
  Function: message(response,message)

  Parameters:
    * response - Twilio.twiml.VoiceResponse, Twilio Voice response in progress
    * message - string, recorded message (URL starting with 'http') to play
                or text message to say
    * language - string, language for text messages, e.g. 'en' for English
                 with an American accent or 'en-gb' for English with a British
                 accent. Use the voice 'alice' for the largest list of
                 supported languages and accents.
    * voice - string, one of 'man', 'woman' or 'alice'.

  Response:
    The input response is modified with further instructions to Play or Say
    the given message. The input response is returned unchanged when the
    given message is empty.
*/
function message(response, message, language, voice) {
  if ( message.length === 0 ) {
    return;
  }
  if ( message.startsWith("http") ) {
    response.play({}, message);
  } else {
    response.say({language:language, voice:voice}, message);
  }
}
exports.output.message = message;

exports.handler = function(env, params, reply) {
  const NO_ERROR = null;
  throw Error("Not implemented!");
  reply(NO_ERROR, 'response');
};
