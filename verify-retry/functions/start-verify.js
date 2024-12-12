/**
 *  Start Verification
 *
 *  This Twilio Function shows you how to send a verification token for Twilio Verify.
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

// Load assets from the Runtime, used to access utility functions
const assets = Runtime.getAssets();
const { detectMissingParams, VerificationException } = require(
  assets['/utils.js'].path
);

/**
 * Retrieves the line type of a given phone number with the Lookup API.
 *
 * @param {Object} client - The Twilio client.
 * @param {string} to - The phone number to check.
 * @returns {Promise<string>} - The line type of the phone number.
 * @throws {VerificationException} - If the phone number is invalid.
 */
async function getLineType(client, to) {
  try {
    const response = await client.lookups.v2
      .phoneNumbers(to)
      .fetch({ fields: 'line_type_intelligence' });

    return response.lineTypeIntelligence.type;
  } catch (error) {
    throw new VerificationException(
      error.status,
      `Invalid phone number: '${to}'`
    );
  }
}

/**
 * This function handles the verification process.
 * It sends a verification token to the provided phone number with the Verify API.
 *
 * @param {Object} context - The context object containing environment variables and Twilio client.
 * @param {Object} event - The event object containing the request parameters.
 * @param {Function} callback - The callback function to return the response.
 */
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    const missingParams = detectMissingParams(['to'], event);
    if (missingParams.length > 0) {
      throw new VerificationException(
        400,
        `Missing parameter; please provide: '${missingParams.join(', ')}'.`
      );
    }

    const client = context.getTwilioClient();
    const service = context.VERIFY_SERVICE_SID;
    const { to } = event;

    const lineType = await getLineType(client, to);

    let channel = event.channel ?? 'sms';
    let message = `Sent ${channel} verification to: ${to}`;

    if (lineType === 'landline') {
      channel = 'call';
      message = `Landline detected. Sent ${channel} verification to: ${to}`;
    }

    const verification = await client.verify
      .services(service)
      .verifications.create({
        to,
        channel,
      });

    response.setStatusCode(200);
    response.setBody({
      success: true,
      attempts: verification.sendCodeAttempts.length,
      message,
    });
    return callback(null, response);
  } catch (error) {
    response.setStatusCode(error.status);
    response.setBody({
      success: false,
      message: error.message,
    });
    return callback(null, response);
  }
};
