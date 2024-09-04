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
  // Creating a new instance of Twilio's MessagingResponse object
  const twiml = new Twilio.twiml.MessagingResponse();

  // Adding a message to the response object. This message will be sent back to the user.
  twiml.message('Hello World');

  // Using the callback function to return the response object (twiml) back to the user
  callback(null, twiml);
};
