/**
 *  Fetch the status of a challenge
 *
 *  Shows whether a challenge has been approved or denied. Can poll this endpoint once a challenge has been issued.
 *
 *
 *  Pre-requisites
 *  - Create a Verify Service (https://www.twilio.com/console/verify/services)
 *  - Create a Challenge (https://www.twilio.com/docs/verify/api/challenge)
 *
 *  Parameters
 *  - identity - required
 *  - sid - required - challenge SID
 *
 *
 *  Returns JSON
 *
 *  on Success:
 *  challenge JSON - https://www.twilio.com/docs/verify/api/challenge#challenge-properties
 *
 *  on Error:
 *  {
 *    "error" {
 *       "message": "Details about your error",
 *       "moreInfo": "Link to error"
 *    }
 *  }
 */

const assets = Runtime.getAssets();
const { detectMissingParams } = require(assets["/missing-params.js"].path);

exports.handler = function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader("Content-Type", "application/json");

  // uncomment to support CORS
  // response.appendHeader('Access-Control-Allow-Origin', '*');
  // response.appendHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  // response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  const missingParams = detectMissingParams(["identity", "sid"], event);
  if (missingParams.length > 0) {
    response.setStatusCode(400);
    response.setBody({
      error: {
        message: `Missing parameter; please provide: '${missingParams.join(
          ", "
        )}'.`,
        moreInfo:
          "https://www.twilio.com/docs/verify/api/challenge#create-a-challenge-resource",
      },
    });
    return callback(null, response);
  }

  const client = context.getTwilioClient();
  const serviceSid = context.VERIFY_SERVICE_SID;

  client.verify
    .services(serviceSid)
    .entities(event.identity)
    .challenges(event.sid)
    .fetch()
    .then((challenge) => {
      response.setStatusCode(200);
      response.setBody(challenge);
      callback(null, response);
    })
    .catch((error) => {
      console.error(error);
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
