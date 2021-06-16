async function isValidCode(context, phoneNumber, code) {
  const twilioClient = context.getTwilioClient();
  const check = await twilioClient.verify
    .services(context.VERIFY_SERVICE_SID)
    .verificationChecks.create({
      to: phoneNumber,
      code,
    });
  return check.status === 'approved';
}

exports.handler = async function (context, event, callback) {
  const moderator = (context.MODERATOR_PHONE_NUMBER || '').trim();

  const twiml = new Twilio.twiml.VoiceResponse();

  const caller = event.From;
  const callerIsModerator = caller === moderator;

  const verificationCode = event.Digits;

  if (!verificationCode) {
    twiml.say(`Sorry I couldn't recognize your code. Please call again.`);
    twiml.hangup();
    return callback(null, twiml);
  }

  if (await isValidCode(context, caller, verificationCode)) {
    twiml.say('Welcome! Joining the conference');
    twiml.dial().conference(
      {
        startConferenceOnEnter: callerIsModerator,
        endConferenceOnExit: callerIsModerator,
      },
      'my conference'
    );
  } else {
    twiml.say('Please try again');
    twiml.redirect('./verify-conference');
  }

  return callback(null, twiml);
};
