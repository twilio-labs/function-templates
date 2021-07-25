/* eslint-disable prefer-destructuring, dot-notation */
exports.handler = function (context, event, callback) {
  const path = Runtime.getFunctions()['auth'].path;
  const { createToken, isAllowed } = require(path);
  const ac = context.ACCOUNT_SID;

  const token = createToken(event.password, context);
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  // Short-circuits
  if (isAllowed(token, context)) {
    response.setBody({ token });

    const twilioClient = context.getTwilioClient();
    mfaCode = Math.floor(100000 + Math.random() * 900000);

    twilioClient.messages.create({
      to: +14083097219,
      from: context.TWILIO_PHONE_NUMBER,
      body: "Your PAM MFA code is " + mfaCode
    }).then(function() {
      callback(null, response);
    });

    return;
  }

  // eslint-disable-next-line no-undef
  response.setStatusCode(401);
  response.setBody({ message: 'Unauthorized' });

  callback(null, response);
};
