const { createCORSResponse } = require('@twilio-labs/runtime-helpers').response;
const { v4: uuidv4 } = require('uuid');

/**
 *  Returns JSON
 *  {
 *    "ok":        boolean,
 *    "message":   string,
 *    "factorSid": string,  // not present if ok is false
 *    "identity":  string,  // not present if ok is false
 *    "uri:        string,  // not present if ok is false
 *    "secret":    string,  // not present if ok is false
 *  }
 */
const assets = Runtime.getAssets();
const { detectMissingParams } = require(assets['/utils.js'].path);

exports.handler = async function (context, event, callback) {
  // set to true to support CORS
  const supportCors = false;
  /* istanbul ignore next */
  const response = supportCors
    ? createCORSResponse('*')
    : new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    const missingParams = detectMissingParams(['name'], event);
    if (missingParams.length > 0) {
      throw new Error(
        `Missing parameter; please provide: '${missingParams.join(', ')}'.`
      );
    }

    const client = context.getTwilioClient();
    const service = context.VERIFY_SERVICE_SID;
    const { name } = event;
    const identity = uuidv4(); // identity should not contain PII

    const factor = await client.verify
      .services(service)
      .entities(identity)
      .newFactors.create({
        friendlyName: name,
        factorType: 'totp',
      });

    response.setStatusCode(200);
    response.setBody({
      ok: true,
      factorSid: factor.sid,
      identity,
      uri: factor.binding.uri,
      secret: factor.binding.secret,
      message: `Please scan the QR code in an authenticator app like Authy.`,
    });
    return callback(null, response);
  } catch (error) {
    response.setStatusCode(error.status || 400);
    response.setBody({
      ok: false,
      message: error.message,
    });
    return callback(null, response);
  }
};
