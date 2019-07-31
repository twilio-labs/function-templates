// # Conference Funlet
// Host a conference call, optionally protected by password digits (stage 1)
// which must be pressed by the caller to enter the conference (stage 2).
// A list of moderators may be defined:
// - other callers will have to wait for a moderator to enter the conference
// - optionally, moderators may be notified by SMS when a new caller arrives

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
