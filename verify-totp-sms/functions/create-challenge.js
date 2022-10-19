const assets = Runtime.getAssets();
const { detectMissingParams } = require(assets['/utils.js'].path);

async function checkToken(entity, factorSid, code) {
  const challenge = await entity.challenges.create({
    authPayload: code,
    factorSid,
  });

  return challenge.status === 'approved';
}

exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    const missingParams = detectMissingParams(
      ['identity', 'code', 'factorSid'],
      event
    );
    if (missingParams.length > 0) {
      throw new Error(
        `Missing parameter; please provide: '${missingParams.join(', ')}'.`
      );
    }

    const client = context.getTwilioClient();
    const service = context.VERIFY_SERVICE_SID;
    const { identity, factorSid, code } = event;

    const entity = client.verify.services(service).entities(identity);
    const approved = await checkToken(entity, factorSid, code);

    if (!approved) {
      throw new Error(
        `Incorrect token. Check your authenticator app (or wait for the token to refresh) and try again.`
      );
    }

    response.setStatusCode(200);
    response.setBody({
      ok: true,
      message: 'Verification success.',
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
