function getValidCallers(context) {
  return (context.VALID_PARTICIPANTS || '').split(',').map((num) => num.trim());
}

async function sendVerificationCode(context, phoneNumber) {
  const twilioClient = context.getTwilioClient();
  const verifyService = twilioClient.verify.services(
    context.VERIFY_SERVICE_SID
  );
  try {
    // check if there is already a pending verification
    await verifyService.verifications(phoneNumber).fetch();
  } catch (err) {
    await verifyService.verifications.create({
      to: phoneNumber,
      channel: 'sms',
    });
  }
}

exports.handler = async function (context, event, callback) {
  if (!context.VERIFY_SERVICE_SID) {
    return callback(new Error('VERIFY_SERVICE_SID has not been configured.'));
  }

  const validCallers = getValidCallers(context);
  const moderator = (context.MODERATOR_PHONE_NUMBER || '').trim();

  const twiml = new Twilio.twiml.VoiceResponse();

  const caller = event.From;
  const callerIsModerator = caller === moderator;
  const callerIsValidParticipant = validCallers.includes(caller);

  if (!callerIsModerator && !callerIsValidParticipant) {
    twiml.say(`Sorry I don't recognize the number you are calling from.`);
    return callback(null, twiml);
  }

  try {
    await sendVerificationCode(context, caller);
  } catch (err) {
    twiml.say('Failed to send verification code. Please call again.');
    return callback(null, twiml);
  }

  twiml
    .gather({
      action: './join-conference',
      numDigits: 6,
      timeout: 60,
    })
    .say('Please enter your code');

  twiml.redirect(context.PATH);

  callback(null, twiml);
};
