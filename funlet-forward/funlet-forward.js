// # Forward Funlet
// Forward the call to a forwarding number, optionally checking that
// the caller is on a white list of allowed numbers (stage 1).
// When the forwarding call ends (stage 2), hang up if it was successful
// or redirect to the fallback URL/Funlet, if any.

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
