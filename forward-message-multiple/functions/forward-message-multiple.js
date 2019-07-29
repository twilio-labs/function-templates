exports.handler = function(context, event, callback) {
  let twiml = new Twilio.twiml.MessagingResponse();
  context.FORWARDING_NUMBERS.split(/,\s?/).forEach(number => {
    console.log(number);
    twiml.message(`From: ${event.From}. Body: ${event.Body}`, {
      to: number
    });
  });
  callback(null, twiml);
};
