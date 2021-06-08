/**
 *  Broadcast a message
 *
 *  Returns JSON
 *  {
 *    "success": boolean,
 *    "error": string // not present if success is true
 *  }
 */
exports.handler = (context, event, callback) => {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  const client = context.getTwilioClient();
  const service = context.VERIFY_SERVICE_SID;

  client.verify
    .services(service)
    .verificationChecks.create({
      to: context.BROADCAST_ADMIN_NUMBER,
      code: event.code,
    })
    // eslint-disable-next-line
    .then((check) => {
      if (check.status === 'approved') {
        client.notify
          .services(context.BROADCAST_NOTIFY_SERVICE_SID)
          .notifications.create({
            tag: event.tag || 'all',
            body: event.body,
          })
          .then(() => {
            response.setStatusCode(200);
            response.setBody({
              success: true,
            });
            return callback(null, response);
          })
          .catch((error) => {
            console.log(error);
            response.setStatusCode(error.status);
            response.setBody({
              success: false,
              error: error.message,
            });
            return callback(null, response);
          });
      } else {
        response.setStatusCode(401);
        response.setBody({
          success: false,
          error: 'Incorrect token.',
        });
        return callback(null, response);
      }
    })
    .catch((error) => {
      console.log(error);
      response.setStatusCode(error.status);
      response.setBody({
        success: false,
        error: error.message,
      });
      callback(null, response);
    });
};
