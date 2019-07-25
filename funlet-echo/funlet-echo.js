// # Echo Funlet

// ## Input
exports.input = {};

function getTwiml(env, params) {
  const MY_TWIML = '<Response><Say>echo</Say></Response>';
  return params.Twiml || env.FUNLET_ECHO_TWIML || MY_TWIML;
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
      getTwiml(env, params)
    )
  );

  reply(NO_ERROR, response);
};
