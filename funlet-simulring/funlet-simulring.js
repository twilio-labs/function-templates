// # Simulring Funlet
// Forward the call to up to 10 forwarding numbers in parallel,
// connecting the first one that picks up (stage 1). When that
// forwarding call ends, just hang up if it was successful,
// or redirect to the fallback URL/Funlet, if any (stage 2).

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
