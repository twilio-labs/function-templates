exports.handler = function(context, event, callback) {
    let blacklist = event.blacklist || context.BLACKLIST || '';
    const blacklistArray = blacklist.toString().split(',').map(num => num.trim());

    let twiml = new Twilio.twiml.VoiceResponse();
    let blocked = true;
    if (blacklistArray.length) {
      if (!blacklistArray.includes(event.From)) {
        blocked = false;
      }
    }
    if (blocked) {
      twiml.reject();
    }
    else {
    // Update this line to your response.
    twiml.redirect('https://demo.twilio.com/docs/voice.xml');
    }
    callback(null, twiml);
  };