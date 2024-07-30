/* eslint-disable camelcase */
/**
 *  - Sends an email verification code
 *  - docs: https://www.twilio.com/docs/verify/api/verification
 *
 *  Pre-requisites
 *  - Create a Verify Service (https://www.twilio.com/console/verify/services)
 *  - Set up Sendgrid template & email integration (https://www.twilio.com/docs/verify/email)
 *
 *  Returns JSON
 *  {
 *    "success": boolean,
 *    "message": string,
 *  }
 */

function callbackUrl(context) {
  const protocol = context.DOMAIN_NAME.startsWith('localhost:')
    ? 'http'
    : 'https';

  return `${protocol}://${context.DOMAIN_NAME}/${context.CALLBACK_PATH}`;
}

exports.callbackUrl = callbackUrl;
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    if (typeof event.to === 'undefined') {
      throw new Error('Missing parameter; please provide an email.');
    }

    const client = context.getTwilioClient();
    const { to } = event;
    const channelConfiguration = {
      template_id: context.VERIFY_TEMPLATE_ID,
      substitutions: {
        email: to,
        callback_url: exports.callbackUrl(context),
      },
    };

    const verification = await client.verify.v2
      .services(context.VERIFY_SERVICE_SID)
      .verifications.create({
        channelConfiguration,
        to,
        channel: 'email',
      });

    response.setStatusCode(200);
    response.setBody({
      success: true,
      message: `Sent verification to ${to}.`,
    });
    return callback(null, response);
  } catch (error) {
    console.error(error);
    response.setStatusCode(error.status || 400);
    response.setBody({
      success: false,
      message: error.message,
    });
    return callback(null, response);
  }
};
