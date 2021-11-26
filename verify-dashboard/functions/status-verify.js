/**
 *  Verification Status
 *  https://www.twilio.com/docs/verify/api/verification
 *
 *  This Function gets the status of a single verification
 *
 *  Pre-requisites
 *  - Create a Verify Service (https://www.twilio.com/console/verify/services)
 *  - Add VERIFY_SERVICE_SID from above to your Environment Variables (https://www.twilio.com/console/functions/configure)
 *
 *
 *  Parameters:
 *   to | required | email, e.164 formatted phone number, or verification SID
 *
 *
 *  Returns JSON of Verification response (https://www.twilio.com/docs/verify/api/verification#verification-response-properties)
 *  and the following:
 *  {
 *    "success": boolean,
 *    "error": {                // not present if success is true
 *      "message": string,
 *      "moreInfo": url string
 *    }
 *  }
 */

const { createCORSResponse } = require('@twilio-labs/runtime-helpers').response;

// eslint-disable-next-line consistent-return
exports.handler = function (context, event, callback) {
  // set to true to support CORS
  const supportCors = false;
  /* istanbul ignore next */
  const response = supportCors
    ? createCORSResponse('*')
    : new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  if (typeof event.to === 'undefined') {
    response.setBody({
      success: false,
      error: {
        message:
          'Missing parameter; please provide a phone number, email, or Verification SID.',
        moreInfo: 'https://www.twilio.com/docs/verify/api/verification',
      },
    });
    response.setStatusCode(400);
    return callback(null, response);
  }

  const client = context.getTwilioClient();
  const service = context.VERIFY_SERVICE_SID;
  const { to } = event;

  client.verify
    .services(service)
    .verifications(to)
    .fetch()
    .then((verification) => {
      response.setStatusCode(200);
      verification.success = true;
      response.setBody(verification);
      callback(null, response);
    })
    .catch((error) => {
      response.setStatusCode(error.status);
      response.setBody({
        success: false,
        error: {
          message: error.message,
          moreInfo: error.moreInfo,
        },
      });
      callback(null, response);
    });
};
