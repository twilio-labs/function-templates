// # Whisper Funlet
// Say a message and optionally request to press a digit (stage 1)
// to check that the recipient is human, and not a voicemail;
// if the check is requested and no digits are pressed, hang up.
// If digits are pressed (stage 2), bridge the call.

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
