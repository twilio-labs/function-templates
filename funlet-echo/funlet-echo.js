// # Echo Funlet
// Reply with the static TwiML provided as parameter.
// This is an alternative to TwiML Bins, which can be a starting point
// to introduce more advanced logic than the TwiML Bins can handle.

// ## Script Parameters

let config={
  // Twiml instructions, as a text string
  twiml:
    '<Response>'+
      '<Say>echo</Say>'+
    '</Response>'
};
exports.config = config;

// ## Input
exports.input = {};

function getTwiml(params, env, config) {
  return params.Twiml || env.FUNLET_ECHO_TWIML || config.twiml;
}
exports.input.getTwiml = getTwiml;

// ## Dependencies
const Twilio = require('twilio');

// ## Output
exports.output = {};

/*
  Function: echo()

  Parameters:
    * twiml - string, input TwiML

  Returns:
    string, the TwiML instructions received as input, unchanged
*/
function echo( twiml ) {
  return twiml;
}
exports.output.echo = echo;

exports.handler = function(env, params, reply) {
  const NO_ERROR = null;

  let response = new Twilio.Response();
  response.appendHeader("Content-Type", "text/xml");

  response.setBody(
    echo(
      getTwiml(params, env, config)
    )
  );

  reply(NO_ERROR, response);
};
