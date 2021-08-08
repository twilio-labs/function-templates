exports.handler = function (context, event, callback) {
  const { path } = Runtime.getFunctions().auth;
  const { isValidPassword, createMfaToken } = require(path);

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  if (isValidPassword(event.password, context)) {
    // Generate and send six digit MFA code to administrator's phone
    const twilioClient = context.getTwilioClient();
    mfaCode = Math.floor(100000 + Math.random() * 900000);
    twilioClient.messages
      .create({
        to: context.ADMINISTRATOR_PHONE,
        from: context.TWILIO_PHONE_NUMBER,
        body: `${mfaCode} is your security code for the PAM application. It is valid for five minutes.`,
      })
      .then(function () {
        // SMS was sent successfully
        response.setBody({
          token: createMfaToken('login', mfaCode, context),
        });

        callback(null, response);
      })
      .catch(function () {
        // if there is any problem in sending SMS
        response.setStatusCode(500);
        response.setBody({
          message:
            'Unable to send security code to your phone at this time. Please try later.',
        });
        callback(null, response);
      });
    return;
  }

  // eslint-disable-next-line no-undef
  response.setStatusCode(401);
  response.setBody({ message: 'Unauthorized' });

  callback(null, response);
};
