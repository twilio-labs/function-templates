/**
 *  Subscribe to updates
 *
 *  Returns JSON
 *  {
 *    "success": boolean,
 *    "error": string // not present if success is true
 *  }
 */

const crypto = require('crypto');

function sendSubscribedNotification(notifyService, identity) {
  return notifyService.notifications
    .create({
      identity,
      body: 'Thank you for subscribing. Reply STOP to unsubscribe at any time.',
    })
    .catch((err) => console.log(err));
}

exports.handler = async (context, event, callback) => {
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
    const verifyService = client.verify.services(context.VERIFY_SERVICE_SID);
    const notifyService = client.notify.services(
      context.BROADCAST_NOTIFY_SERVICE_SID
    );

    const { to, code } = event;
    const identity = crypto.createHash('sha256').update(to).digest('hex');
    const tags = typeof event.tags === 'object' ? event.tags : [event.tags];

    const check = await verifyService.verificationChecks.create({ to, code });
    if (check.status === 'approved') {
      await notifyService.bindings.create({
        identity,
        bindingType: 'sms',
        address: to,
        tag: tags,
      });
      await sendSubscribedNotification(notifyService, identity);

      response.setStatusCode(200);
      response.setBody({
        success: true,
      });
      return callback(null, response);
    }
    console.error('Incorrect token.');
    response.setStatusCode(401);
    response.setBody({
      success: false,
      error: 'Incorrect token.',
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
