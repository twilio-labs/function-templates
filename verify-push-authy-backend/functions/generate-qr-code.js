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
const assets = Runtime.getAssets();
const { detectMissingParams } = require(assets['/missing-params.js'].path);
const { digestMessage } = require(assets['/digest-message.js'].path);
const QRCode = require('qrcode');

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
  const hashIdentity = context.IDENTITY_PROCESSING !== 'raw';
  const identity = hashIdentity
    ? digestMessage(event.identity)
    : event.identity;
  const factorType = 'push';
  const { factorFriendlyName } = event;

  client.verify
    .services(serviceSid)
    .accessTokens.create({ identity, factorType, factorFriendlyName })
    .then((resp) => {
      response.setStatusCode(200);
      const uri = `authy://factor?accessTokenSid=${resp.sid}&serviceSid=${resp.serviceSid}&accountSid=${resp.accountSid}`;
      QRCode.toDataURL(uri)
        .then((url) => {
          response.setBody({
            uri,
            qr: url,
          });
          callback(null, response);
        })
        .catch((error) => {
          cconsole.error(error);
          response.setStatusCode(400);
          response.setBody({
            ...error,
          });
          callback(null, response);
        });
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
