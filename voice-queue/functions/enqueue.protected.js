exports.handler = function (context, event, callback) {
  const { CallSid, From } = event;

  if (From) {
    const client = context.getTwilioClient();
    const path = `https://${context.DOMAIN_NAME}`;
    // Make an outbound call to your phone number to connect the two legs.
    // Use the inbound CallSid as the unique identifier for the queue.
    client.calls.create({
      to: context.YOUR_PHONE_NUMBER,
      from: context.TWILIO_PHONE_NUMBER,
      url: `${path}/dial-queue?fromCallSid=${CallSid}&from=${From}`
    });
  }
  // Enqueue the inbound caller.
  // waitUrl points to an endpoint to <Play> the mp3 set in the env variables.
  const response = new Twilio.twiml.VoiceResponse();
  response.enqueue({
    waitUrl: '/hold-music'
  }, CallSid);

  callback(null, response);
};