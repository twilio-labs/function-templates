exports.handler = function (context, event, callback) {
  const response = new Twilio.twiml.VoiceResponse();
  // HOLD_MUSIC_URL points to the audio file set in your environment variables.
  response.play(context.HOLD_MUSIC_URL);
  callback(null, response);
};