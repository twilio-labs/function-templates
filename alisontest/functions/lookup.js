/**
 *  Lookup - validate a phone number
 *
 *  This function will tell you whether or not a phone number is valid using Twilio's Lookup API
 *
 *  Parameters:
 *  "phone" - string - phone number in E.164 format (https://www.twilio.com/docs/glossary/what-e164)
 *
 *  Returns JSON
 *  {
 *    "success": boolean,
 *    "error": string      // not present if success is true
 *  }
 */

exports.handler = function (context, event, callback) {
    const response = new Twilio.Response();
    response.appendHeader("Content-Type", "application/json");

    // uncomment to support CORS
    // response.appendHeader('Access-Control-Allow-Origin', '*');
    // response.appendHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    // response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (event.phone === "" || typeof event.phone === "undefined") {
        response.setBody({
            success: false,
            error: "Missing parameter; please provide a phone number.",
        });
        response.setStatusCode(400);
        return callback(null, response);
    }

    const client = context.getTwilioClient();

    client.lookups
        .phoneNumbers(event.phone)
        .fetch()
        .then((resp) => {
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
            callback(null, response);
        });
};
