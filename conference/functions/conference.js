/**
 * Conference Template
 *
 * This Function creates a conference line that people can call-in to. Learn more about using <Conference> here:
 * https://www.twilio.com/docs/api/twiml/conference
 */

exports.handler = function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  // Change the conference name to anything you like.
  const conferenceName = 'Snowy Owl';
  twiml.dial().conference(conferenceName);
  callback(null, twiml);
};
