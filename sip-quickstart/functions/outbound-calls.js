exports.handler = function (context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  const sipTo = event.To;
  // eslint-disable-next-line prefer-named-capture-group
  const matches = sipTo.match(/sip:([+]?[0-9]+)@/);
  if (matches && matches.length > 1) {
    const to = matches[1];
    console.log(
      `Dialing ${to} from ${sipTo} with Caller ID ${context.CALLER_ID}`
    );
    twiml.dial(to, { callerId: context.CALLER_ID });
  } else {
    console.log(`Dialing ${sipTo}`);
    twiml.dial().sip(sipTo);
  }
  callback(null, twiml);
};
