/**
 *  Check Verification
 *
 *  This Function shows you how to check a verification token for Twilio Verify.
 *
 *  Pre-requisites
 *  - Create a Verify Service (https://www.twilio.com/console/verify/services)
 *  - Add VERIFY_SERVICE_SID from above to your Environment Variables (https://www.twilio.com/console/functions/configure)
 *  - Enable ACCOUNT_SID and AUTH_TOKEN in your functions configuration (https://www.twilio.com/console/functions/configure)
 *
 *
 *  Returns JSON:
 *  {
 *    "success": boolean,
 *    "message": string
 *  }
 */
const assets = Runtime.getAssets();
const { detectMissingParams, VerificationException } = require(
  assets['/utils.js'].path
);

/**
 * Checks the verification status of a given code for a specified service and recipient.
 *
 * @param {Object} client - The client object used to interact with the verification service.
 * @param {string} service - The ID of the verification service.
 * @param {string} to - The recipient's phone number or email address.
 * @param {string} code - The verification code to check.
 * @returns {Promise<string>} - A promise that resolves to a success message if the verification is approved.
 * @throws {VerificationException} - Throws an exception if the verification code is incorrect.
 */
async function verifyToken(client, service, to, code) {
  const check = await client.verify
    .services(service)
    .verificationChecks.create({ to, code });

  if (check.status === 'approved') {
    return 'Verification success.';
  }

  throw new VerificationException(401, 'Incorrect token.');
}

/**
 * Twilio Function to handle verification check.
 *
 * @param {Object} context - The context object containing environment variables.
 * @param {Object} event - The event object containing the request parameters.
 * @param {Function} callback - The callback function to return the response.
 */
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    const missingParams = detectMissingParams(['to', 'code'], event);
    if (missingParams.length > 0) {
      throw new VerificationException(
        400,
        `Missing parameter; please provide: '${missingParams.join(', ')}'.`
      );
    }

    const client = context.getTwilioClient();
    const service = context.VERIFY_SERVICE_SID;
    const { to, code } = event;
    const message = await verifyToken(client, service, to, code);

    response.setStatusCode(200);
    response.setBody({
      success: true,
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
