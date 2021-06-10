exports.handler = function (context, event, callback) {
  let twiml = new Twilio.twiml.MessagingResponse();
  twiml.message(`From: ${event.From}. Body: ${event.Body}`, {
    to: context.MY_PHONE_NUMBER,
  });
  callback(null, twiml);
};
