/**
 *  Request an Access Token
 *
 *
 *  Pre-requisites
 *  - Create a Verify Service (https://www.twilio.com/console/verify/services)
 *
 *  Parameters
 *  - identity - required - unique user id, no PII
 *
 *
 *  Returns JSON
 *
 *  on Success:
 *  {
 *    "token": "eyJ6aXAiOiJERUYiLCJraWQiOiJTQVNfUzNfX19...."
 *    "serviceSid": "VAxxx...",
 *    "identity": "AXi7y....",
 *    "factorType": "push"
 *  }
 *
 *  on Error:
 *  {
 *    "error" {
 *       "message": "Details about your error",
 *       "moreInfo": "Link to error"
 *    }
 *  }
 */
const crypto = require('crypto');

const assets = Runtime.getAssets();
const { detectMissingParams } = require(assets['/missing-params.js'].path);

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

  const missingParams = detectMissingParams(['identity'], event);
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
  const identity = crypto
    .createHash('sha256')
    .update(event.identity)
    .digest('hex');
  const factorType = 'push';

  client.verify
    .services(serviceSid)
    .accessTokens.create({ identity, factorType })
    .then((resp) => {
      response.setStatusCode(200);
      response.setBody({
        token: resp.token,
        serviceSid,
        identity,
        factorType,
      });
      callback(null, response);
    })
    .catch((error) => {
      console.error(error);
      response.setStatusCode(error.status);
      response.setBody({
        ...error,
      });
      callback(null, response);
    });
};
