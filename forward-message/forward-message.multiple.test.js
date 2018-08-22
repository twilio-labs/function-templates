exports.handler = function(context, event, callback) {
  let twiml = new Twilio.twiml.MessagingResponse();
  twiml.message(`From: ${event.From}. Body: ${event.Body}`, {
    to: '+1XXXXXXXXXX'
  });
  twiml.message(`From: ${event.From}. Body: ${event.Body}`, {
    to: '+1XXXXXXXXXX'
  });
  callback(null, twiml);
};
