/**
 *  Lookup - Validate a phone number using Twilio Lookup API v2
 *
 *  This function validates phone numbers to ensure they are real, valid, and properly formatted.
 *  It uses Twilio's Lookup API v2 which provides authoritative phone number validation.
 *
 *  Required Environment Variables:
 *  - ACCOUNT_SID: Your Twilio Account SID (automatically provided by Twilio Functions)
 *  - AUTH_TOKEN: Your Twilio Auth Token (automatically provided by Twilio Functions)
 *
 *  Parameters (from event object):
 *  - phone (string, required): Phone number in E.164 format (e.g., +14155552671)
 *    Learn more about E.164: https://www.twilio.com/docs/glossary/what-e164
 *
 *  Returns JSON:
 *  Success response:
 *  {
 *    "success": true
 *  }
 *
 *  Error response:
 *  {
 *    "success": false,
 *    "error": "Error message describing what went wrong"
 *  }
 *
 *  API Documentation:
 *  - Lookup API v2: https://www.twilio.com/docs/lookup/v2-api
 *  - Twilio Functions: https://www.twilio.com/docs/runtime/functions
 */

exports.handler = async function (context, event, callback) {
  // Create a Twilio Response object for returning JSON
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    // Validate that phone parameter is provided and not empty
    if (event.phone === '' || typeof event.phone === 'undefined') {
      throw new Error('Missing parameter; please provide a phone number.');
    }

    // Initialize Twilio client with credentials from environment
    // context.getTwilioClient() automatically uses ACCOUNT_SID and AUTH_TOKEN
    const client = context.getTwilioClient();

    // Call Twilio Lookup API v2 to validate the phone number
    // The API will return information about the number including validity
    // Note: This is a free API call - no additional charges beyond standard Lookup pricing
    const lookup = await client.lookups.v2.phoneNumbers(event.phone).fetch();

    // Extract the validation result from the Lookup API response
    const success = lookup.valid;

    // If the phone number is not valid, throw an error with details
    if (!success) {
      throw new Error(
        `Invalid phone number ${event.phone}: ${lookup.validationErrors}`
      );
    }

    // Return success response
    response.setStatusCode(200);
    response.setBody({ success });
    return callback(null, response);
  } catch (error) {
    // Handle any errors (validation errors, API errors, network errors, etc.)
    // Return appropriate HTTP status code:
    // - error.status (if available from Twilio API error)
    // - 400 (Bad Request) as default for validation errors
    response.setStatusCode(error.status || 400);
    response.setBody({
      success: false,
      error: error.message,
    });
    return callback(null, response);
  }
};
