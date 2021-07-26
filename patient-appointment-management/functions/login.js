/* eslint-disable prefer-destructuring, dot-notation */
exports.handler = function (context, event, callback) {
  const path = Runtime.getFunctions()['auth'].path;
  const { createToken, createPreMfaToken, isAllowed } = require(path);
  const ac = context.ACCOUNT_SID;

  const loginToken = createToken(event.password, context);
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  // Short-circuits
  if (isAllowed(loginToken, context)) {

    const twilioClient = context.getTwilioClient();
    mfaCode = Math.floor(100000 + Math.random() * 900000);

    twilioClient.messages.create({
      to: context.ADMINISTRATOR_PHONE,
      from: context.TWILIO_PHONE_NUMBER,
      body:  mfaCode + " is your code for the PAM application. It is valid for five minutes."
    }).then(function() {
      response.setBody({
        token: createPreMfaToken(mfaCode,context)
      });
      callback(null, response);
    }).catch(function(){
      // if there is any problem in sending SMS
      response.setStatusCode(500);
      response.setBody({});
      callback(null, response);
    });

    return;
  }

  // eslint-disable-next-line no-undef
  response.setStatusCode(401);
  response.setBody({ message: 'Unauthorized' });

  callback(null, response);
};
