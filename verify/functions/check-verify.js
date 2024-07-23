/**
 *  Check Verification
 *
 *  Accepts a user-provided code and checks it against the verification token sent to the user.
 *  Wraps the /verification-check endpoint: https://www.twilio.com/docs/verify/api/verification-check
 *
 *  Pre-requisites
 *  - Create a Verify Service (https://www.twilio.com/console/verify/services)
 *  - Send an OTP to the user via the /start-verify function
 *
 *  Returns JSON:
 *  {
 *    "success": boolean,
 *    "message": string
 *  }
 */
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    if (typeof event.to === 'undefined' || typeof event.code === 'undefined') {
      throw new Error('Missing parameter.');
    }

    const client = context.getTwilioClient();
    const { VERIFY_SERVICE_SID } = context;
    const { to, code } = event;

    const check = await client.verify
      .services(VERIFY_SERVICE_SID)
      .verificationChecks.create({ to, code });

    if (check.status === 'approved') {
      response.setStatusCode(200);
      response.setBody({
        success: true,
        message: 'Verification success.',
      });
      return callback(null, response);
    }

    throw new Error('Incorrect token.');
  } catch (error) {
    console.error(error.message);
    response.setBody({
      success: false,
      message: error.message,
    });
    return callback(null, response);
  }
};
