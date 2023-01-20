const MY_NUMBER = '+15095550100';

exports.handler = (context, event, callback) => {
  // Create a new messaging response object
  const twiml = new Twilio.twiml.MessagingResponse();
  /*
   * Use any of the Node.js SDK methods, such as `message`, to compose a response
   * Access incoming text information like the from number and contents off of `event`
   * Note: providing a `to` parameter like so will forward this text instead of responding to the sender
   */
  twiml.message({ to: MY_NUMBER }, `${event.From}: ${event.Body}`);
  /*
   * Return the TwiML as the second argument to `callback`
   * This will render the response as XML in reply to the webhook request
   */
  return callback(null, twiml);
};
