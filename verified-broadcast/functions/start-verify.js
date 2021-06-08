/**
 *  Start Verification
 *
 *  Returns JSON
 *  {
 *    "success": boolean,
 *    "error": string // not present if success is true
 *  }
 */

exports.handler = function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  const client = context.getTwilioClient();
  const service = context.VERIFY_SERVICE_SID;
  const to = event.to || context.BROADCAST_ADMIN_NUMBER;

  client.verify
    .services(service)
    .verifications.create({
      to,
      channel: 'sms',
    })
    .then((verification) => {
      console.log(`Sent verification: '${verification.sid}'`);
      response.setStatusCode(200);
      response.setBody({
        success: true,
      });
      callback(null, response);
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
};
