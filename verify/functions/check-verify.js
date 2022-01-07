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

  client.verify
    .services(service)
    .verificationChecks.create({
      to,
      code,
    })
    .then((check) => {
      if (check.status === 'approved') {
        response.setStatusCode(200);
        response.setBody({
          success: true,
          message: 'Verification success.',
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
      console.log(error);
      response.setStatusCode(error.status);
      response.setBody({
        success: false,
        message: error.message,
      });
      return callback(null, response);
    });
};
