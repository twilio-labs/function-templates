exports.handler = async function (context, event, callback) {
  const { phoneNumber } = event;
  const { VERIFY_SERVICE_SID: serviceSid } = context;

  // Ensure the Twilio client is initialized
  const client = context.getTwilioClient();

  if (!serviceSid) {
    console.error('Missing VERIFY_SERVICE_SID');
    return callback('Missing VERIFY_SERVICE_SID');
  }

  try {
    // Validate phone number using Twilio Lookup API with Node.js library
    const lookupResponse = await client.lookups.v2
      .phoneNumbers(phoneNumber)
      .fetch();

    if (!lookupResponse.valid) {
      const message =
        'Invalid phone number. Please enter a valid number in E.164 format.';
      console.error(message, lookupResponse);
      return callback(null, { success: false, message });
    }

    // Start verification if the phone number is valid
    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({ to: phoneNumber, channel: 'sms' });

    console.log('Verification response:', verification);

    return callback(null, {
      success: true,
      message: `Verification sent to ${phoneNumber}`,
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return callback(null, { success: false, message: error.message });
  }
};
