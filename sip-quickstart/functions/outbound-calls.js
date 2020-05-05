exports.handler = function(context, event, callback) {
    const twiml = new Twilio.twiml.VoiceResponse();
    const sipTo = event.To;
    const matches = sipTo.match(/sip:([+]?[0-9]+)@/);
    if (matches.length > 1) {
      const to = matches[1];
      console.log(`Dialing ${to} from ${sipTo}`);
      // TODO: Set caller ID to a choice
      twiml.dial(to, {callerId: '+15868001102'});
    } else {
      twiml.say('Whoops this function is intended to be used for SIP only');
    }
    callback(null, twiml);

  };
  