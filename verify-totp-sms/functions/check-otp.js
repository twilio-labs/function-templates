const { detectMissingParams } = require('../assets/utils.private');

function validateParams(paramsList, event) {
  const missingParams = detectMissingParams(paramsList, event);
  if (missingParams.length > 0) {
    throw new Error(
      `Missing parameter; please provide: '${missingParams.join(', ')}'.`
    );
  }
}

exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    const client = context.getTwilioClient();
    const serviceSid = context.VERIFY_SERVICE_SID;
    const service = client.verify.services(serviceSid);

    validateParams(['to', 'code'], event);
    const { to, code } = event;
    const check = await service.verificationChecks.create({ to, code });

    if (check.status === 'approved') {
      response.setStatusCode(200);
      response.setBody({
        ok: true,
        message: 'Verification success.',
      });
      return callback(null, response);
    }

    throw new Error('Incorrect token.');
  } catch (error) {
    console.error(error.message);
    response.setBody({
      ok: false,
      message: error.message,
    });
    return callback(null, response);
  }
};
