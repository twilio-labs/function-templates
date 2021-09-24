/**
 *  Start Verification
 *
 *  Returns JSON
 *  {
 *    "success": boolean,
 *    "error": string // not present if success is true
 *  }
 */

exports.handler = async function (context, event, callback) {
  const { setupResourcesIfRequired } = require(Runtime.getAssets()['/setup.js']
    .path);
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    if (!(await setupResourcesIfRequired(context))) {
      response.setBody({ success: false, error: 'Failed to setup services' });
      response.setStatusCode(500);
      return callback(null, response);
    }

    const client = context.getTwilioClient();
    const service = context.VERIFY_SERVICE_SID;
    const { to } = event;

    if (!to) {
      response.setStatusCode(400);
      response.setBody({ success: false, error: 'Missing "to" parameter' });
      return callback(null, response);
    }

    const verification = await client.verify
      .services(service)
      .verifications.create({
        to,
        channel: 'sms',
      });
    console.log(`Sent verification: '${verification.sid}'`);
    response.setStatusCode(200);
    response.setBody({
      success: true,
    });
    return callback(null, response);
  } catch (error) {
    console.error(error);
    response.setStatusCode(error.status);
    response.setBody({
      success: false,
      error: error.message,
    });
    return callback(null, response);
  }
};
