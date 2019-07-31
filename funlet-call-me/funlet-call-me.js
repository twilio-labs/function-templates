// # Call Me Funlet
// Forward the call to your forwarding number (stage 1)
// then hang up, or if the call failed, redirect the caller
// to a fallback URL/Funlet (stage 2)

// ## Input
exports.input = {};

// ## Dependencies
const Twilio = require('twilio');

// ## Output
exports.output = {};

exports.handler = function(env, params, reply) {
  const NO_ERROR = null;
  throw Error("Not implemented!");
  reply(NO_ERROR, 'response');
};
