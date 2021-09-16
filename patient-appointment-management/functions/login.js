exports.handler = function (context, event, callback) {
  const { path } = Runtime.getFunctions().auth;
  const { isValidPassword, createMfaToken } = require(path);

  async function sendMfaCode(context) {
    const path0 = Runtime.getFunctions().helpers.path;
    const { getParam } = require(path0);
    context.TWILIO_VERIFY_SID = await getParam(context, 'TWILIO_VERIFY_SID');

    const twilioClient = context.getTwilioClient();
    const channel = 'sms';
    return twilioClient.verify
      .services(context.TWILIO_VERIFY_SID)
      .verifications.create({
        to: context.ADMINISTRATOR_PHONE,
        channel,
      });
  }

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  if (!isValidPassword(event.password, context)) {
    response.setStatusCode(401);
    response.setBody({ message: 'Unauthorized' });
    return callback(null, response);
  }

  sendMfaCode(context)
    .then(function () {
      response.setBody({
        token: createMfaToken('login', context),
      });
      return callback(null, response);
    })
    .catch(function () {
      response.setStatusCode(500);
      response.setBody({
        message:
          'Unable to send security code to your phone at this time. Please try later.',
      });
      return callback(null, response);
    });
  return null;
};
