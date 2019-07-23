// # Echo Funlet

// ## Input
exports.input = {};

function getTwiml(context, event) {
  const MY_TWIML = '<Response><Say>echo</Say></Response>';
  return event.Twiml || context.FUNLET_ECHO_TWIML || MY_TWIML;
}
exports.input.getTwiml = getTwiml;

// ## Dependencies
const Twilio = require('twilio');

// ## Output
exports.output = {};

/*
  Function: echo(twiml)

  Parameters:
    * Twiml - string, input TwiML

  Returns:
    string, the TwiML instructions received as input, unchanged
*/
function echo( twiml ) {
  return twiml;
}
exports.output.echo = echo;

exports.handler = function(context, event, callback) {
  // Create a custom response in XML format
  let response = new Twilio.Response();
  response.appendHeader("Content-Type", "text/xml");

  response.setBody(
    echo(
      twiml(context, event)
    )
  );

  // Return the response
  callback(null, response);
};
