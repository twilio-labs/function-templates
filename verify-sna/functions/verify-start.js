/**
 * Create a new verification
 *
 * Creates a new SNA verification for a given phone number
 *
 * Pre-requisites
 * - Create a Verify Service (https://www.twilio.com/console/verify/services)
 * - Add VERIFY_SERVICE_SID from above to your Environment Variables (https://www.twilio.com/console/functions/configure)
 * - Enable ACCOUNT_SID and AUTH_TOKEN in your functions configuration (https://www.twilio.com/console/functions/configure)
 *
 * Parameters
 * - countryCode - required
 * - phoneNumber - required
 *
 * Returns JSON
 *
 * on Success:
 * {
 *      "message": string
 *      "snaUrl": string
 * }
 *
 * on Error:
 * {
 *      "message": string
 * }
 */

const assets = Runtime.getAssets();
const { createVerification } = require(assets['/services/verifications.js']
  .path);
const {
  detectMissingParams,
  countryCodeField,
  phoneNumberField,
} = require(assets['/services/helpers.js'].path);

// eslint-disable-next-line consistent-return
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  const missingParams = detectMissingParams(
    [countryCodeField, phoneNumberField],
    event
  );
  if (missingParams.length > 0) {
    response.setStatusCode(400);
    response.setBody({
      message: `Missing parameters; please provide: '${missingParams.join(
        ', '
      )}'.`,
    });
    return callback(null, response);
  }

  try {
    const client = context.getTwilioClient();
    const verifyServiceSid = context.VERIFY_SERVICE_SID;
    const { countryCode, phoneNumber } = event;
    const verification = await client.verify
      .services(verifyServiceSid)
      .verifications.create({
        to: `${countryCode}${phoneNumber}`,
        channel: 'sna',
      });
    await createVerification(context, verification.to);
    response.setStatusCode(200);
    response.setBody({
      message: 'Creation of SNA verification successful',
      snaUrl: verification.sna.url,
    });
    return callback(null, response);
  } catch (error) {
    const statusCode = error.status || 400;
    response.setStatusCode(statusCode);
    response.setBody({
      message: error.message,
    });
    return callback(null, response);
  }
};
