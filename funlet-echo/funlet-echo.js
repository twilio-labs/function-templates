// # Echo Funlet

// ## Parameters

// * MY_TWIML: string, default TwiML output
const MY_TWIML = '<Response><Say>echo</Say></Response>';

// ## Dependencies

const Twilio = require('twilio');

/*
  ## Function: echo()

  ### Parameters
    * event.Twiml: string, input TwiML read from GET/POST parameters
    * context.ECHO_TWIML: string, input TwiML read from the environment
    * MY_TWIML: string, input TwiML read from constant at top of this script

  ### Returns
    the first non-empty string found in the three input parameters.
*/
function echo(context, event) {
  return event.Twiml || context.ECHO_TWIML || MY_TWIML;
}

// ## Module Exports

exports.echo = echo;
exports.handler = function(context, event, callback) {
  // Create a custom response in XML format
  let response = new Twilio.Response();
  response.appendHeader("Content-Type", "text/xml");

  response.setBody( echo(event, context) )

  // Return the response
  callback(null, response);
};
