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

  // PhoneNumber is a Custom Parameter passed in from the Client
  // If it is present we should call out...
  if (event.PhoneNumber) {
    // Wrap the phone number or client name in the appropriate TwiML verb
    // if is a valid phone number
    const attr = isAValidPhoneNumber(event.PhoneNumber) ? "number" : "client";

    const dial = twiml.dial({
      answerOnBridge: true,
      callerId: context.CALLER_ID,
    });
    dial[attr]({}, event.PhoneNumber);
  } else {
    // ...Otherwise we can assume it's an inbound call to our Twilio Incoming Number
    twiml.dial().client(context.DEFAULT_CLIENT_NAME);
  }
  callback(null, twiml);
};
