exports.handler = (context, event, callback) => {
  // Create a new messaging response object
  const twiml = new Twilio.twiml.MessagingResponse();

  // Access the incoming text content from `event.Body`
  const incomingMessage = event.Body.toLowerCase();

  // Use any of the Node.js SDK methods, such as `message`, to compose a response
  if (incomingMessage.includes('hello')) {
    twiml.message('Hello, there!');
  } else if (incomingMessage.includes('bye')) {
    twiml.message('Goodbye!');
  } else {
    twiml.message('Not sure what you meant! Please say hello or bye!');
  }

  /*
   * Return the TwiML as the second argument to `callback`
   * This will render the response as XML in reply to the webhook request
   */
  return callback(null, twiml);
};
