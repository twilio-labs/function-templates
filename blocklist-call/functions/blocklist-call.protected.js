/*
 * Reject Calls with Blocklist
 *
 * Description: Block inbound calls from specific, individual numbers.
 *
 * Contents:
 * 1. Main Handler
 */

/*
 * 1. Main Handler
 *
 * This is the entry point to the function. The function expects the incoming request to be a voice webhook.
 * When an incoming call is made, the code detects the incoming phone number and compares it to the list of blocked numbers specified in /.env
 * If the call is from a blocked phone number, the call is rejected and the call ends for the caller.
 * If the incoming call is not on the blocked list, the call is accepted and the script will redirect to another URL for TwiML.
 */

exports.handler = function (context, event, callback) {
  const blocklist = event.blocklist || context.BLOCKLIST || '';
  const blocklistArray = blocklist
    .toString()
    .split(',')
    .map((num) => num.trim());
  const twiml = new Twilio.twiml.VoiceResponse();

  let blocked = false;
  if (blocklistArray.length > 0 && blocklistArray.includes(event.From)) {
    blocked = true;
  }

  if (blocked) {
    twiml.reject();
  } else {
    // Update this line to your response.
    twiml.redirect(
      {
        method: 'GET',
      },
      'https://demo.twilio.com/docs/voice.xml'
    );
  }
  callback(null, twiml);
};
