/**
 *  Broadcast a message
 *
 *  Returns JSON
 *  {
 *    "success": boolean,
 *    "error": string // not present if success is true
 *  }
 */
exports.handler = async (context, event, callback) => {
  const { isAuthenticated } = require(Runtime.getAssets()['/auth.js'].path);
  const { setupResourcesIfRequired } = require(Runtime.getAssets()['/setup.js']
    .path);

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  if (!isAuthenticated(context, event)) {
    response.setBody({ success: false, error: 'INVALID CREDENTIALS' });
    response.setStatusCode(401);
    return callback(null, response);
  }

  try {
    if (!(await setupResourcesIfRequired(context))) {
      response.setBody({ success: false, error: 'Failed to setup services' });
      response.setStatusCode(500);
      return callback(null, response);
    }

    const client = context.getTwilioClient();
    await client.notify
      .services(context.BROADCAST_NOTIFY_SERVICE_SID)
      .notifications.create({
        tag: event.tag || 'all',
        body: event.body,
      });
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
