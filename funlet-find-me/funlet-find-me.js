// # Find Me Funlet
// Forward the call to one of up to 10 forwarding numbers,
// tried one by one (stage 1). After each call ends (stage 2),
// just hang up if the call was successful, or try forwarding
// to the next number (back to stage 1) until no forwarding numbers
// are left, then redirect to the fallback URL/Funlet, if any.

// ## Script Parameters

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
