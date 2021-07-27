/**
 *  Start Verification
 *
 *  This Function shows you how to send a verification token for Twilio Verify.
 *
 *  Pre-requisites
 *  - Create a Verify Service (https://www.twilio.com/console/verify/services)
 *  - Add VERIFY_SERVICE_SID from above to your Environment Variables (https://www.twilio.com/console/functions/configure)
 *  - Enable ACCOUNT_SID and AUTH_TOKEN in your functions configuration (https://www.twilio.com/console/functions/configure)
 *
 *
 *  Returns JSON
 *  {
 *    "success":  boolean,
 *    "attempts": integer, // not present if success is false
 *    "message":  string
 *  }
 */

// eslint-disable-next-line consistent-return
exports.handler = function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  /*
   * uncomment to support CORS
   * response.appendHeader('Access-Control-Allow-Origin', '*');
   * response.appendHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
   * response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
   */

  if (typeof event.to === 'undefined') {
    response.setBody({
      success: false,
      message: 'Missing parameter; please provide a phone number.',
    });
    response.setStatusCode(400);
    return callback(null, response);
  }

  const client = context.getTwilioClient();
  const service = context.VERIFY_SERVICE_SID;
  const { to } = event;

  const lookupResponse = client.lookups.v1
    .phoneNumbers(to)
    .fetch({ type: ['carrier'] })
    .then((pn) => pn.carrier.type);

  lookupResponse
    .then((lineType) => {
      let channel;
      let message;

      if (lineType === 'landline') {
        channel = 'call';
        message = `Landline detected. Sent ${channel} verification to: ${to}`;
      } else {
        channel = typeof event.channel === 'undefined' ? 'sms' : event.channel;
        message = `Sent ${channel} verification to: ${to}`;
      }

      client.verify
        .services(service)
        .verifications.create({
          to,
          channel,
        })
        .then((verification) => {
          console.log(`Sent verification ${verification.sid}`);
          response.setStatusCode(200);
          response.setBody({
            success: true,
            attempts: verification.sendCodeAttempts.length,
            message,
          });
          return callback(null, response);
        })
        .catch((error) => {
          console.log(error);
          response.setStatusCode(error.status);
          response.setBody({
            success: false,
            message: error.message,
          });
          return callback(null, response);
        });
    })
    .catch((error) => {
      console.log(error);
      response.setStatusCode(error.status);
      response.setBody({
        success: false,
        message: `Invalid phone number: '${to}'`,
      });
      return callback(null, response);
    });
};
