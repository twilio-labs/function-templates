/**
 *  Start Verification
 *
 *  Sends a verification token to the provided phone number or email.
 *  Wraps the /verification endpoint: https://www.twilio.com/docs/verify/api/verification
 *
 *  Pre-requisites
 *  - Create a Verify Service (https://www.twilio.com/console/verify/services)
 *
 *  Returns JSON
 *  {
 *    "success": boolean,
 *    "error":   string   // not present if success is true
 *  }
 */
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    if (typeof event.to === 'undefined' || event.to.trim() === '') {
      throw new Error(
        "Missing 'to' parameter; please provide a phone number or email."
      );
    }

    const client = context.getTwilioClient();
    const { VERIFY_SERVICE_SID } = context;
    const { to } = event;
    const channel =
      typeof event.channel === 'undefined' ? 'sms' : event.channel;
    const locale = typeof event.locale === 'undefined' ? 'en' : event.locale;

    const verification = await client.verify
      .services(VERIFY_SERVICE_SID)
      .verifications.create({
        to,
        channel,
        locale,
      });

    console.log(`Sent verification: '${verification.sid}'`);
    response.setStatusCode(200);
    response.setBody({ success: true });
    return callback(null, response);
  } catch (error) {
    const statusCode = error.status || 400;
    response.setStatusCode(statusCode);
    response.setBody({
      success: false,
      error: error.message,
    });
    return callback(null, response);
  }
};
