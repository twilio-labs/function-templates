exports.handler = (context, event, callback) => {
  let twiml = new Twilio.twiml.VoiceResponse();

  twiml.dial().conference(
    {
      statusCallback: 'call-outbound-join',
      statusCallbackEvent: 'join end',
      endConferenceOnExit: true,
    },
    event.taskSid
  );

  callback(null, twiml);
};
