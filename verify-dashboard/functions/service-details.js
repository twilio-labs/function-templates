/**
 *  Service Details
 *
 *  This Function returns details about the verification service used in this project.
 *  The Verify Service SID is pulled from environment variables.
 *
 *  Pre-requisites
 *  - Create a Verify Service (https://www.twilio.com/console/verify/services)
 *  - Add VERIFY_SERVICE_SID from above to your Environment Variables (https://www.twilio.com/console/functions/configure)
 *
 *  Parameters:
 *   NONE
 *
 */

const { createCORSResponse } = require('@twilio-labs/runtime-helpers').response;

exports.handler = function (context, event, callback) {
  // set to true to support CORS
  const supportCors = false;
  /* istanbul ignore next */
  const response = supportCors
    ? createCORSResponse('*')
    : new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  const client = context.getTwilioClient();
  const service = context.VERIFY_SERVICE_SID;

  client.verify
    .services(service)
    .fetch()
    .then((service) => {
      response.setStatusCode(200);
      service.success = true;
      response.setBody(service);
      callback(null, response);
    })
    .catch((error) => {
      response.setStatusCode(error.status);
      response.setBody({
        success: false,
        error: {
          sid: service,
          message: error.message,
          moreInfo: error.moreInfo,
        },
      });
      callback(null, response);
    });
};
