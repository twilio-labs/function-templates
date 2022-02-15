/**
 * Checks if the given value is valid as phone number
 * @param {Number|String} number
 * @return {Boolean}
 */
function isAValidPhoneNumber(number) {
  return /^[\d\+\-\(\) ]+$/.test(number);
}

exports.handler = function (context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();

  if (event.To) {
    /*
     * Wrap the phone number or client name in the appropriate TwiML verb
     * if is a valid phone number
     */
    const attr = isAValidPhoneNumber(event.To) ? 'number' : 'client';

    const dial = twiml.dial({
      answerOnBridge: true,
      callerId: process.env.CALLER_ID,
    });
    dial[attr]({}, event.To);
  } else {
    twiml.say('Thanks for calling!');
  }

  callback(null, twiml);
};
