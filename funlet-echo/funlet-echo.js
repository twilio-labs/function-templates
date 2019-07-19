const MY_TWIML = '<Response><Say>echo</Say></Response>';

const Twilio = require('twilio');

exports.handler = function(context, event, callback) {
  // Create a custom response in XML format
  let response = new Twilio.Response();
  response.appendHeader("Content-Type", "text/xml");

  // Use input TwiML as output
  response.setBody( event.Twiml || context.ECHO_TWIML || MY_TWIML )

  // Return the response
  callback(null, response);
};
