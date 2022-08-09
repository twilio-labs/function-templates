const { v4: uuidv4 } = require('uuid');

const assets = Runtime.getAssets();
const { detectMissingParams } = require(assets['/utils.js'].path);

exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
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
