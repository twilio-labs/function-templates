/**
 *  Check Verification
 *
 *  This Function shows you how to check a verification token for Twilio Verify.
 *
 *  Pre-requisites
 *  - Create a Verify Service (https://www.twilio.com/console/verify/services)
 *  - Add VERIFY_SERVICE_SID from above to your Environment Variables (https://www.twilio.com/console/functions/configure)
 *
 *  Parameters:
 *   to                 | required | email, e.164 formatted phone number, or verification SID
 *   verification_code  | required | one-time passcode sent to the user
 *
 *  Returns JSON:
 *  {
 *    "success": boolean,
 *    "message": string
 *  }
 */

// eslint-disable-next-line consistent-return
exports.handler = function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  /*
   * uncomment to support CORS
   * response.appendHeader('Access-Control-Allow-Origin', '*');
   * response.appendHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
   * response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
   */

  if (
    typeof event.to === 'undefined' ||
    typeof event.verification_code === 'undefined'
  ) {
    response.setBody({
      success: false,
      message: 'Missing parameter.',
    });
    response.setStatusCode(400);
    return callback(null, response);
  }

  const client = context.getTwilioClient();
  const service = context.VERIFY_SERVICE_SID;
  const { to, verification_code: code } = event;

  const isVeSid = (sid) => {
    return sid.startsWith('VE') && sid.length === 34 && !sid.includes('@');
  };

  const verificationKey = isVeSid(to) ? 'verificationSid' : 'to';

  client.verify
    .services(service)
    .verificationChecks.create({
      [verificationKey]: to,
      code,
    })
    .then((check) => {
      if (check.status === 'approved') {
        response.setStatusCode(200);
        response.setBody({
          success: true,
          message: `Verification '${to}' approved.`,
        });
        return callback(null, response);
      }
      response.setStatusCode(401);
      response.setBody({
        success: false,
        message: 'Incorrect token.',
      });
      return callback(null, response);
    })
    .catch((error) => {
      let { message } = error;
      response.setStatusCode(error.status);
      if (error.status === 404) {
        message = `No pending verifications found for <strong>${to}</strong> to check.\n\nNote: Twilio deletes the verification SID once:<ul><li>it expires</li><li>it's approved</li><li>the max attempts to check a code have been reached</li></ul>\nTo check what happened with a specific verification, please use the <a href="https://www.twilio.com/console/verify/services/${service}/logs">logs in the Twilio Console</a>.`;
      }
      response.setBody({
        success: false,
        message,
      });
      return callback(null, response);
    });
};
