function rejectCaller() {
  const twiml = new Twilio.twiml.VoiceResponse();
  twiml.say(`I'm sorry but the code is invalid. Please try again. Thank you`);
  twiml.hangup();
  return twiml;
}

function joinConference() {
  const twiml = new Twilio.twiml.VoiceResponse();
  twiml.say('Thank you! You are joining the conference');
  twiml.dial().conference('My pin protected conference');
  return twiml;
}

function promptForPin() {
  const twiml = new Twilio.twiml.VoiceResponse();
  twiml
    .gather()
    .say(
      'Welcome! Please enter the PIN for this conference line followed by a hash.'
    );
  return twiml;
}

exports.handler = function (context, event, callback) {
  if (!context.CONFERENCE_PIN) {
    return callback(new Error('This function needs a conference pin to work'));
  }

  let twiml;
  if (!event.Digits) {
    twiml = promptForPin();
  } else {
    if (event.Digits.toString() === context.CONFERENCE_PIN.toString()) {
      twiml = joinConference();
    } else {
      twiml = rejectCaller();
    }
  }

  callback(null, twiml);
};
