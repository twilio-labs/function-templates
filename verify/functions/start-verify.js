/**
 *  Start Verification
 *
 *  This Function shows you how to send a verification token for Twilio Verify.
 *
 *  Pre-requisites
 *  - Create a Verify Service (https://www.twilio.com/console/verify/services)
 *  - Add VERIFY_SERVICE_SID from above to your Environment Variables (https://www.twilio.com/console/functions/configure)
 *  - Enable ACCOUNT_SID and AUTH_TOKEN in your functions configuration (https://www.twilio.com/console/functions/configure)
 *
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

  /*
   * uncomment to support CORS
   * response.appendHeader('Access-Control-Allow-Origin', '*');
   * response.appendHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
   * response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
   */

  try {
    if (typeof event.to === 'undefined' || event.to.trim() === '') {
      throw new Error(
        "Missing 'to' parameter; please provide a phone number or email."
      );
    }

    /*
     * DELETE THIS BLOCK IF YOU WANT TO ENABLE THE VOICE CHANNEL
     * Learn more about toll fraud
     * https://www.twilio.com/docs/verify/preventing-toll-fraud
     */
    if (event.channel === 'call') {
      throw new Error(
        'Calls disabled by default. Update the code in <code>start-verify.js</code> to enable.'
      );
    }

    const client = context.getTwilioClient();
    const service = context.VERIFY_SERVICE_SID;
    const { to } = event;
    const channel =
      typeof event.channel === 'undefined' ? 'sms' : event.channel;
    const locale = typeof event.locale === 'undefined' ? 'en' : event.locale;

    const verification = await client.verify
      .services(service)
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
