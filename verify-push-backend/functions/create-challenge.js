/**
 *  Create an authentication challenge
 *
 *  Sends a push notification to registered factor.
 *
 *
 *  Pre-requisites
 *  - Create a Verify Service (https://www.twilio.com/console/verify/services)
 *  - Create a Factor on a device
 *
 *  Parameters
 *  - identity - required
 *  - factor SID - required
 *  - message - required
 *  - details like IP, Location, etc. - optional
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

  const missingParams = detectMissingParams(
    ["identity", "message", "factor"],
    event
  );
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

  let { identity, message, factor, ...details } = event;
  let fields = [];
  for (const [key, value] of Object.entries(details)) {
    fields.push({ label: key, value: value });
  }

  client.verify
    .services(serviceSid)
    .entities(identity)
    .challenges.create({
      factorSid: event.factor,
      "details.message": message,
      "details.fields": fields,
    })
    .then((challenge) => {
      response.setStatusCode(200);
      response.setBody(challenge);
      callback(null, response);
    })
    .catch((error) => {
      console.error(error);
      response.setStatusCode(error.status);
      response.setBody({
        error: {
          message: error.message,
          moreInfo: error.moreInfo,
        },
      });
      callback(null, response);
    });
};
