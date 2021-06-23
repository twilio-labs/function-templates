exports.handler = function (context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  twiml.play('https://demo.twilio.com/docs/classic.mp3');

  callback(null, twiml);
};
