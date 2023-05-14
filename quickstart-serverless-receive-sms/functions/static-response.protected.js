exports.handler = (context, event, callback) => {
  // Create a new messaging response object
  const twiml = new Twilio.twiml.MessagingResponse();
  // Use any of the Node.js SDK methods, such as `message`, to compose a response
  twiml.message('Hello, World!');
  /*
   * Return the TwiML as the second argument to `callback`
   * This will render the response as XML in reply to the webhook request
   */
  return callback(null, twiml);
};
