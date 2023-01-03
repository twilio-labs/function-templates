exports.handler = (context, event, callback) => {
  let twiml = new Twilio.twiml.VoiceResponse();

  twiml.dial().conference(
    {
      endConferenceOnExit: true,
    },
    event.conferenceName
  );

  callback(null, twiml);
};
