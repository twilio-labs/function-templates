/**
 *  Returns JSON:
 *  {
 *    "ok": boolean,
 *    "message": string,
 *  }
 */
const assets = Runtime.getAssets();
const { detectMissingParams } = require(assets['/utils.js'].path);

exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  /*
   * uncomment to support CORS
   * response.appendHeader('Access-Control-Allow-Origin', '*');
   * response.appendHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
   * response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
   */

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
    const checkedFactor = await entity
      .factors(factorSid)
      .update({ authPayload: code });

    if (checkedFactor.status !== 'verified') {
      throw new Error('Incorrect code.');
    }

    response.setStatusCode(200);
    response.setBody({
      ok: true,
      message: 'Factor verified.',
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
