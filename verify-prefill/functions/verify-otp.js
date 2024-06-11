exports.handler = async function (context, event, callback) {
  const { phoneNumber, code } = event;
  const { VERIFY_SERVICE_SID: serviceSid } = context;

  try {
    const client = context.getTwilioClient();

    if (!serviceSid) {
      throw new Error('Missing VERIFY_SERVICE_SID');
    }

    // Verify the OTP using Twilio Verify API V2
    const verificationCheck = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: phoneNumber, code });

    console.log('Verification check response:', verificationCheck);

    if (verificationCheck.status === 'approved') {
      return callback(null, {
        success: true,
        verificationSid: verificationCheck.sid,
      });
    }

    return callback(null, {
      success: false,
      message: `Verification failed. Status: ${verificationCheck.status}`,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return callback(null, { success: false, message: error.message });
  }
};
