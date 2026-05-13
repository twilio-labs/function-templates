/*
 * Send a Hello World Message
 * Description: When your Twilio Phone Number associated with this function
 * receives a message, it will respond with "Hello World".
 *
 * Contents:
 * 1. Main Handler
 */

/*
 * 1. Main Handler
 *
 * This is the entry point to your Twilio Function,
 * which will create a new Messaging Response using Twiml
 * and use this to send a "Hello World" message back to the user.
 * We then use the callback to return from your function
 * with the Twiml Messaging Response you defined earlier.
 * In the callback in non-error situations, the first
 * parameter is null and the second parameter
 * is the value you want to return.
 */

// Defining the handler function

exports.handler = function (context, event, callback) {
  /*
   * Create a new TwiML MessagingResponse object
   * This generates the XML that tells Twilio how to respond to the incoming message
   */
  const twiml = new Twilio.twiml.MessagingResponse();

  // Add a message to the TwiML response
  twiml.message('Hello World');

  /*
   * Return the TwiML response using the callback
   * The first parameter is for errors (null = no error)
   * The second parameter is the response to send back
   */
  callback(null, twiml);
};
