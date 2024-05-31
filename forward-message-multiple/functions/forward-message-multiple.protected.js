exports.handler = function (context, event, callback) {
  const twiml = new Twilio.twiml.MessagingResponse();
  context.FORWARDING_NUMBERS.split(/,\s?/).forEach((number) => {
    twiml.message({ to: number }, `From: ${event.From}. Body: ${event.Body}`);
  });
  callback(null, twiml);
};
