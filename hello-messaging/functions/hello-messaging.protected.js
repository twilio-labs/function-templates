// Defining the handler function
exports.handler = function (context, event, callback) {
  // Creating a new instance of Twilio's MessagingResponse object
  const twiml = new Twilio.twiml.MessagingResponse();

  // Adding a message to the response object. This message will be sent back to the user.
  twiml.message('Hello World');

  // Using the callback function to return the response object (twiml) back to the user
  callback(null, twiml);
};
