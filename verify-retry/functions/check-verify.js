/**
 *  Check Verification
 *
 *  This Function shows you how to check a verification token for Twilio Verify.
 *
 *  Pre-requisites
 *  - Create a Verify Service (https://www.twilio.com/console/verify/services)
 *  - Add VERIFY_SERVICE_SID from above to your Environment Variables (https://www.twilio.com/console/functions/configure)
 *  - Enable ACCOUNT_SID and AUTH_TOKEN in your functions configuration (https://www.twilio.com/console/functions/configure)
 *
 *
 *  Returns JSON:
 *  {
 *    "success": boolean,
 *    "message": string
 *  }
 */
const assets = Runtime.getAssets();
const { detectMissingParams, VerificationException } = require(
  assets['/utils.js'].path
);

async function checkVerification(client, service, to, code) {
  const check = await client.verify
    .services(service)
    .verificationChecks.create({
      to,
      code,
    });

  if (check.status === 'approved') {
    return 'Verification success.';
    // eslint-disable-next-line no-else-return
  } else {
    throw new VerificationException(401, 'Incorrect token.');
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
    const missingParams = detectMissingParams(['to', 'code'], event);
    if (missingParams.length > 0) {
      throw new VerificationException(
        400,
        `Missing parameter; please provide: '${missingParams.join(', ')}'.`
      );
    }

    const client = context.getTwilioClient();
    const service = context.VERIFY_SERVICE_SID;
    const { to, code } = event;

    const message = await checkVerification(client, service, to, code);

    response.setStatusCode(200);
    response.setBody({
      success: true,
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
