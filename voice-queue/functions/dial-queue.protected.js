exports.handler = function (context, event, callback) {
  const fromSid = event.fromCallSid;
  // If no fromSid is set, error out.
  if (!fromSid) {
    return callback({
      status: 500,
      message: 'No CallSid found. Inbound voice webhook should be set to /enqueue'
    }, null);
  }

  // Split the phone number out so that <Say> reads every number when identifying the caller.
  const from = event.from;
  const fromFormatted = from.split('').join(' ');

  // Announce who is calling.
  const response = new Twilio.twiml.VoiceResponse();
  response.say(`You have an incoming call from ${fromFormatted}`);
  // Dial into the queue where the initiated caller is waiting.
  response.dial().queue(fromSid);

  callback(null, response);
};