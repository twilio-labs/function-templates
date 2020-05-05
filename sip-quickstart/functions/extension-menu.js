exports.handler = function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  if (event.Digits === undefined) {
    twiml.gather({action: './extension-menu'})
      .say("Please enter the extension of your party, or press 0 for a list of all extensions");
  } else if (event.Digits === "0") {
    // TODO: Loop the extensions
  } else {
    const sipAddress = registry[event.Digits];
    if (sipAddress) {
      twiml.say(`Connecting to extension ${event.Digits}`);
      twiml.dial(sipAddress);
    }
  }
  return callback(null, twiml);
};