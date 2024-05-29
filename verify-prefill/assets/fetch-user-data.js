/* eslint-disable prefer-destructuring */
exports.handler = async function (context, event, callback) {
  const phoneNumber = event.phoneNumber;
  const verificationSid = event.verificationSid;
  const lookupApiKey = context.LOOKUP_API_KEY;
  const lookupApiSecret = context.LOOKUP_API_SECRET;

  try {
    // Use dynamic import to load the node-fetch module
    const fetch = (await import('node-fetch')).default;

    const lookupUrl = `https://lookups.twilio.com/v2/PhoneNumbers/${phoneNumber}?Fields=pre_fill&VerificationSid=${verificationSid}`;
    const lookupResponse = await fetch(lookupUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${lookupApiKey}:${lookupApiSecret}`
        ).toString('base64')}`,
      },
    });

    const lookupData = await lookupResponse.json();

    return callback(null, { success: true, prefillData: lookupData.pre_fill });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return callback(null, { success: false, message: error.message });
  }
};
