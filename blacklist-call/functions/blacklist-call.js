exports.handler = function(context, event, callback) {
    // List all blocked phone numbers in quotes and E.164 formatting, separated by a comma
    let blacklist = event.blacklist;  
    let twiml = new Twilio.twiml.VoiceResponse();
    let blocked = true;
    if (blacklist.length > 0) {
      if (blacklist.indexOf(event.From) === -1) {
        blocked = false;
      }
    }
    if (blocked) {
      twiml.reject();
    }
    else {
    // if the caller's number is not blocked, redirect to your existing webhook
    twiml.redirect(context.HTTP_REDIRECT_URL);
    }
    callback(null, twiml);
  };