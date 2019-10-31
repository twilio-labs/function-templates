/**
 *  Check Verification
 *
 *  This Function shows you how to check a verification token for Twilio Verify.
 *
 *  Pre-requisites
 *  - Create a Verify Service (https://www.twilio.com/console/verify/services)
 *  - Add VERIFY_SERVICE_SID from above to your Environment Variables (https://www.twilio.com/console/functions/configure)
 *  - Enable ACCOUNT_SID and AUTH_TOKEN in your functions configuration (https://www.twilio.com/console/functions/configure)
 */

exports.handler = function(context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
  
  // uncomment to support CORS
  // response.appendHeader('Access-Control-Allow-Origin', '*');
  // response.appendHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  // response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (typeof event.verification_code === "undefined" || typeof event.phone_number === "undefined") {
    response.setBody({
      "status": false,
      "message": "Missing parameter. Please provide both phone_number and verification_code."
    })
    response.setStatusCode(400);
    return callback(null, response);
  }

  const client = context.getTwilioClient();
  const service = context.VERIFY_SERVICE_SID
  const to = event.phone_number;
  const code = event.verification_code;
          
  client.verify.services(service)
    .verificationChecks
    .create({to: to, code: code})
    .then(check => {
      if (check.status == "approved") {
        check.success = true;
        response.setBody(check);
        response.setStatusCode(200);
        callback(null, response);
      } else {
        response.setBody({
          "success": false,
          "message": "Incorrect code."
        })
        callback(null, response);
      }
    })
    .catch(error => {
      response.setBody({
        "success": false,
        "message": error
      })
      response.setStatusCode(400);
      callback(null, response);
    });
};
