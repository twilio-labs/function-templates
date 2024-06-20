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
 *    "success":  boolean,
 *    "attempts": integer, // not present if success is false
 *    "message":  string
 *  }
 */

const assets = Runtime.getAssets();
const { detectMissingParams, VerificationException } = require(
  assets['/utils.js'].path
);

async function getLineType(client, to) {
  try {
    const response = await client.lookups.v2
      .phoneNumbers(to)
      .fetch({ fields: 'line_type_intelligence' });

    return response.lineTypeIntelligence.type;
  } catch (error) {
    throw new VerificationException(
      error.status,
      `Invalid phone number: '${to}'`
    );
  }
}

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
    const missingParams = detectMissingParams(['to'], event);
    if (missingParams.length > 0) {
      throw new VerificationException(
        400,
        `Missing parameter; please provide: '${missingParams.join(', ')}'.`
      );
    }

    const client = context.getTwilioClient();
    const service = context.VERIFY_SERVICE_SID;
    const { to } = event;

    const lineType = await getLineType(client, to);

    let channel = typeof event.channel === 'undefined' ? 'sms' : event.channel;
    let message = `Sent ${channel} verification to: ${to}`;

    if (lineType === 'landline') {
      channel = 'call';
      message = `Landline detected. Sent ${channel} verification to: ${to}`;
    }

    const verification = await client.verify
      .services(service)
      .verifications.create({
        to,
        channel,
      });

    response.setStatusCode(200);
    response.setBody({
      success: true,
      attempts: verification.sendCodeAttempts.length,
      message,
    });
    return callback(null, response);
  } catch (error) {
    response.setStatusCode(error.status);
    response.setBody({
      success: false,
      message: error.message,
    });
    return callback(null, response);
  }
};
