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

exports.handler = function(env, params, reply) {
  const NO_ERROR = null;
  throw Error("Not implemented!");
  reply(NO_ERROR, 'response');
};
