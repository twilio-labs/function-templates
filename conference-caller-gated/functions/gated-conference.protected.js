function rejectCaller() {
  const twiml = new Twilio.twiml.VoiceResponse();
  twiml.say(`I'm sorry but I don't recognize your number. Have a good day.`);
  twiml.hangup();
  return twiml;
}

function joinConference(isModerator) {
  const twiml = new Twilio.twiml.VoiceResponse();
  twiml.say('Thank you! You are joining the conference');
  twiml.dial().conference(
    {
      startConferenceOnEnter: isModerator,
      endConferenceOnExit: isModerator,
    },
    'My gated conference'
  );
  return twiml;
}

exports.handler = function (context, event, callback) {
  const validParticipants = context.VALID_PARTICIPANTS.split(',').map((num) =>
    num.trim()
  );

  const isValidParticipant = validParticipants.includes(event.From);
  const isModerator = event.From === context.MODERATOR_PHONE_NUMBER.trim();

  let twiml;

  if (!isValidParticipant && !isModerator) {
    twiml = rejectCaller();
  } else {
    twiml = joinConference(isModerator);
  }
  callback(null, twiml);
};
