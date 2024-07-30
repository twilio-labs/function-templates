/**
 *  - Check if the verification code is correct
 *  - docs: https://www.twilio.com/docs/verify/api/verification-check
 *
 *  Returns JSON:
 *  {
 *    "success": boolean,
 *    "message": string
 *  }
 */
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    const { to, code } = event;
    [to, code].forEach((param) => {
      if (typeof param === 'undefined' || param === null) {
        throw new ApiError(`Missing parameter.`, 400);
      }
    });

    const client = context.getTwilioClient();
    const verificationCheck = await client.verify.v2
      .services(context.VERIFY_SERVICE_SID)
      .verificationChecks.create({ to, code });

    if (verificationCheck.status !== 'approved') {
      throw new ApiError('Incorrect token.', 401);
    }

    response.setStatusCode(200);
    response.setBody({
      success: true,
      message: 'Verification success.',
    });
    return callback(null, response);
  } catch (error) {
    console.log(error);
    response.setStatusCode(error.status || 500);
    response.setBody({
      success: false,
      message: error.message,
    });
    return callback(null, response);
  }
};
