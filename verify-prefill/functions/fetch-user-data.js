const fetch = require('node-fetch');

exports.handler = async function (context, event, callback) {
  const { phoneNumber, verificationSid } = event;
  const lookupApiKey = context.ACCOUNT_SID;
  const lookupApiSecret = context.AUTH_TOKEN;

  try {
    const lookupUrl = `https://lookups.twilio.com/v2/PhoneNumbers/${phoneNumber}?Fields=pre_fill&VerificationSid=${verificationSid}`;
    const lookupResponse = await fetch(lookupUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          // eslint-disable-next-line sonarjs/no-nested-template-literals
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
