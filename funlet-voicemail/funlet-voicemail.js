// # Voicemail Funlet
// Play a message then record voicemail (stage 1). Once the voicemail
// has been recorded (stage 2) or the optional speech-to-text transcription
// has completed (stage 3), send an email notification for the new voicemail.

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
