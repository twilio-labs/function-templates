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

exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    if (event.phone === '' || typeof event.phone === 'undefined') {
      throw new Error('Missing parameter; please provide a phone number.');
    }

    const client = context.getTwilioClient();
    const lookup = await client.lookups.v2.phoneNumbers(event.phone).fetch();
    const success = lookup.valid;

    if (!success) {
      throw new Error(
        `Invalid phone number ${event.phone}: ${lookup.validationErrors}`
      );
    }

    response.setStatusCode(200);
    response.setBody({ success });
    return callback(null, response);
  } catch (error) {
    response.setStatusCode(error.status || 400);
    response.setBody({
      success: false,
      error: error.message,
    });
    return callback(null, response);
  }
};
