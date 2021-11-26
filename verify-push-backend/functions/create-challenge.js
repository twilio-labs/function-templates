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
 *  - hiddenDetails - optional
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

const { createCORSResponse } = require('@twilio-labs/runtime-helpers').response;

const assets = Runtime.getAssets();
const { detectMissingParams } = require(assets['/missing-params.js'].path);
const { digestMessage } = require(assets['/digest-message.js'].path);

// eslint-disable-next-line consistent-return
exports.handler = function (context, event, callback) {
  // set to true to support CORS
  const supportCors = false;
  const response = supportCors
    ? createCORSResponse('*')
    : new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  const missingParams = detectMissingParams(
    ['identity', 'message', 'factor'],
    event
  );
  if (missingParams.length > 0) {
    response.setStatusCode(400);
    response.setBody({
      error: {
        message: `Missing parameter; please provide: '${missingParams.join(
          ', '
        )}'.`,
        moreInfo:
          'https://www.twilio.com/docs/verify/api/challenge#create-a-challenge-resource',
      },
    });
    return callback(null, response);
  }

  const client = context.getTwilioClient();
  const serviceSid = context.VERIFY_SERVICE_SID;
  const hashIdentity = context.IDENTITY_PROCESSING !== 'raw';

  const { identity, message, factor, hiddenDetails, ...details } = event;
  const identityValue = hashIdentity ? digestMessage(identity) : identity;

  const fields = [];
  for (const [key, value] of Object.entries(details)) {
    fields.push({ label: key, value });
  }

  client.verify
    .services(serviceSid)
    .entities(identityValue)
    .challenges.create({
      factorSid: event.factor,
      'details.message': message,
      'details.fields': fields,
      hiddenDetails,
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
