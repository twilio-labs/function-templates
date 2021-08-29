exports.handler = function (context, event, callback) {
  const { path } = Runtime.getFunctions().auth;
  const { createAppToken, isValidMfaToken } = require(path);

  async function verifyMfaCode(code, context) {
    const path0 = Runtime.getFunctions().helpers.path;
    const { getParam, setParam } = require(path0);
    console.log('mfa - A');
    context.TWILIO_VERIFY_SID = await getParam(context, 'TWILIO_VERIFY_SID');

    const twilioClient = context.getTwilioClient();
    const channel = 'sms';
    return twilioClient.verify
      .services(context.TWILIO_VERIFY_SID)
      .verificationChecks.create({
        to: context.ADMINISTRATOR_PHONE,
        code,
      });
  }

  const TWILIO_VERIFY_SID = 'TWILIO_VERIFY_SID';
  const ac = context.ACCOUNT_SID;
  const jwt = require('jsonwebtoken');

  if (!isValidMfaToken(event.token, context)) {
    const response = new Twilio.Response();
    response.setStatusCode(401);
    response.appendHeader(
      'Error-Message',
      'Invalid or expired token. Please refresh the page and login again.'
    );
    response.appendHeader('Content-Type', 'application/json');
    response.setBody({ message: 'Unauthorized' });

    return callback(null, response);
  }

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
  const twilioClient = context.getTwilioClient();

  verifyMfaCode(event.mfaCode, context)
    .then((verificationCheck) => {
      if (verificationCheck.status === 'approved') {

        response.setBody({
          token: createAppToken('mfa', context),
        });
        return callback(null, response);
      }

      response.setStatusCode(401);
      response.appendHeader(
        'Error-Message',
        'Invalid code. Please check your phone for verification code and try again.'
      );
      return callback(null, response);
    })
    .catch((error) => {
      console.error(error);
      response.setStatusCode(401);
      response.appendHeader(
        'Error-Message',
        'Invalid code. Please check your phone and try again.'
      );
      callback(false);
    });
  return null;
};
