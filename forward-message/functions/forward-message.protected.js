exports.handler = function (context, event, callback) {
  const twiml = new Twilio.twiml.MessagingResponse();
  twiml.message(
    { to: context.MY_PHONE_NUMBER },
    `From: ${event.From}. Body: ${event.Body}`
  );
  callback(null, twiml);
};
