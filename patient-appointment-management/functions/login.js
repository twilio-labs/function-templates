exports.handler = function (context, event, callback) {
  const { path } = Runtime.getFunctions().auth;
  const { isValidPassword, createMfaToken } = require(path);

  const TWILIO_VERIFY_SID = 'TWILIO_VERIFY_SID';
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
      callback(null, response);
    })
    .catch(function (err) {
      response.setStatusCode(500);
      response.setBody({
        message:
          'Unable to send security code to your phone at this time. Please try later.',
      });
      callback(null, response);
    });
};

async function sendMfaCode(context) {
  const path0 = Runtime.getFunctions().helpers.path;
  const { getParam, setParam } = require(path0);
  context.TWILIO_VERIFY_SID = await getParam(context, 'TWILIO_VERIFY_SID');
  console.log(context.TWILIO_VERIFY_SID);

  const twilioClient = context.getTwilioClient();
  const channel = 'sms';
  return twilioClient.verify
    .services(context.TWILIO_VERIFY_SID)
    .verifications.create({
      to: context.ADMINISTRATOR_PHONE,
      channel,
    });
}
