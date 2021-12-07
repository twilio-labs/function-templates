/**
 *  Returns JSON:
 *  {
 *    "ok": boolean,
 *    "message": string
 *  }
 */
const { createCORSResponse } = require('@twilio-labs/runtime-helpers').response;

const assets = Runtime.getAssets();
const { detectMissingParams } = require(assets['/utils.js'].path);

class VerificationException extends Error {
  constructor(status, message) {
    super(`Error ${status}: ${message}`);

    this.status = status;
    this.message = message;
  }
}

async function checkToken(entity, factorSid, code) {
  const challenge = await entity.challenges.create({
    authPayload: code,
    factorSid,
  });
  if (challenge.status === 'approved') {
    return 'Verification success.';
    // eslint-disable-next-line no-else-return
  } else {
    throw new VerificationException(
      401,
      `Incorrect token. Check your authenticator app (or wait for the token to refresh) and try again.`
    );
  }
}

exports.handler = async function (context, event, callback) {
  // set to true to support CORS
  const supportCors = false;
  /* istanbul ignore next */
  const response = supportCors
    ? createCORSResponse('*')
    : new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    const missingParams = detectMissingParams(
      ['identity', 'code', 'factorSid'],
      event
    );
    if (missingParams.length > 0) {
      throw new VerificationException(
        400,
        `Missing parameter; please provide: '${missingParams.join(', ')}'.`
      );
    }

    const client = context.getTwilioClient();
    const service = context.VERIFY_SERVICE_SID;
    const { identity, factorSid, code } = event;

    const entity = client.verify.services(service).entities(identity);
    const message = await checkToken(entity, factorSid, code);

    response.setStatusCode(200);
    response.setBody({
      ok: true,
      message,
    });
    return callback(null, response);
  } catch (error) {
    response.setStatusCode(error.status);
    response.setBody({
      ok: false,
      message: error.message,
    });
    return callback(null, response);
  }
};
