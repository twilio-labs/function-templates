/* eslint-disable prefer-destructuring */
exports.handler = async function (context, event, callback) {
  const phoneNumber = event.phoneNumber;
  const code = event.code;
  const serviceSid = context.VERIFY_SERVICE_SID;

  const client = context.getTwilioClient();

  if (!serviceSid) {
    console.error('Missing VERIFY_SERVICE_SID');
    callback('Missing VERIFY_SERVICE_SID');
    return;
  }

  try {
    // Verify the OTP using Twilio Verify API V2
    const verificationCheck = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: phoneNumber, code: code });

    console.log('Verification check response:', verificationCheck);

    if (verificationCheck.status === 'approved') {
      callback(null, { success: true, verificationSid: verificationCheck.sid });
    } else {
      callback(null, {
        success: false,
        message: 'Verification failed. Status: ' + verificationCheck.status,
      });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    callback(null, { success: false, message: error.message });
  }
};
