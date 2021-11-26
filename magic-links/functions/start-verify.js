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
  const response = supportCors
    ? createCORSResponse('*')
    : new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  if (typeof event.to === 'undefined') {
    response.setBody({
      success: false,
      error: {
        message: 'Missing parameter; please provide an email.',
        moreInfo: 'https://www.twilio.com/docs/verify/api/verification',
      },
    });
    response.setStatusCode(400);
    return callback(null, response);
  }

  const client = context.getTwilioClient();
  const service = context.VERIFY_SERVICE_SID;
  const { to } = event;
  const protocol = context.DOMAIN_NAME.startsWith('localhost:')
    ? 'http'
    : 'https';
  const callbackUrl = `${protocol}://${
    context.DOMAIN_NAME
  }${context.PATH.substr(0, context.PATH.lastIndexOf('/'))}/${
    context.CALLBACK_PATH
  }`;

  client.verify
    .services(service)
    .verifications.create({
      to,
      channel: 'email',
      channelConfiguration: {
        substitutions: {
          // used in email template
          email: to,
          // eslint-disable-next-line camelcase
          callback_url: callbackUrl,
        },
      },
    })
    .then((verification) => {
      console.log(`Sent verification: '${verification.sid}'`);
      response.setStatusCode(200);
      response.setBody({
        success: true,
      });
      callback(null, response);
    })
    .catch((error) => {
      console.log(error);
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
