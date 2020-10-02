/**
 *  Verification Status
 *  https://www.twilio.com/docs/verify/api/verification
 *
 *  This Function gets the status of a single verification
 * 
 *  Pre-requisites
 *  - Create a Verify Service (https://www.twilio.com/console/verify/services)
 *  - Add VERIFY_SERVICE_SID from above to your Environment Variables (https://www.twilio.com/console/functions/configure)
 * 
 *  
 *  Parameters:
 *   to | required | email, e.164 formatted phone number, or verification SID
 *
 *
 *  Returns JSON of Verification response (https://www.twilio.com/docs/verify/api/verification#verification-response-properties)
 *  and the following:
 *  {
 *    "success": boolean,
 *    "error": {                // not present if success is true
 *      "message": string,
 *      "moreInfo": url string
 *    }
 *  }
 */

exports.handler = function(context, event, callback) {
    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/json');
    
    // uncomment to support CORS
    // response.appendHeader('Access-Control-Allow-Origin', '*');
    // response.appendHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    // response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (typeof event.to === 'undefined') {
      response.setBody({
        success: false,
        error: {
          message: 'Missing parameter; please provide a phone number, email, or Verification SID.',
          moreInfo: 'https://www.twilio.com/docs/verify/api/verification'
        }
      })
      response.setStatusCode(400);
      return callback(null, response);
    }

    const client = context.getTwilioClient();
    const service = context.VERIFY_SERVICE_SID;
    const to = event.to;
  
    client.verify.services(service)
      .verifications(to)
      .fetch()
      .then(verification => {
        response.setStatusCode(200);
        verification.success = true;
        response.setBody(verification);
        callback(null, response);
      })
      .catch(error => {
        response.setStatusCode(error.status);
        response.setBody({
          success: false,
          error: {
            message: error.message,
            moreInfo: error.moreInfo
          }
        });
        callback(null, response);
      });
  };