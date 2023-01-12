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

// eslint-disable-next-line consistent-return
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  /*
   * uncomment to support CORS
   * response.appendHeader('Access-Control-Allow-Origin', '*');
   * response.appendHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
   * response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
   */

  try {
    if (event.phone === '' || typeof event.phone === 'undefined') {
      throw new Error('Missing parameter; please provide a phone number.');
    }

    const client = context.getTwilioClient();
    const lookup = await client.lookups.v2.phoneNumbers(event.phone).fetch();

    const success = lookup.valid;
    if (success) {
      response.setStatusCode(200);
      response.setBody({ success });
      return callback(null, response);
    }

    throw new Error(
      `Invalid phone number ${event.phone}: ${lookup.validationErrors}`
    );
  } catch (error) {
    response.setBody({
      success: false,
      error: error.message,
    });
    response.setStatusCode(error.status || 400);
    return callback(null, response);
  }
};
