/**
 * Check a verification
 *
 * Checks a SNA verification for a given phone number
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
 *      "success": boolean
 *      "message": string
 * }
 *
 * on Error:
 * {
 *      "message": string
 * }
 */

const assets = Runtime.getAssets();
const { checkVerification } = require(assets['/services/verifications.js']
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
    const service = context.VERIFY_SERVICE_SID;

    const { countryCode, phoneNumber } = event;

    const check = await client.verify
      .services(service)
      .verificationChecks.create({ to: `${countryCode}${phoneNumber}` });

    if (check.status === 'approved') {
      response.setStatusCode(200);
      response.setBody({
        success: true,
        message: 'SNA verification successful, phone number verified',
      });
      await checkVerification(check.to, 'verified');
    } else if (
      check.snaAttemptsErrorCodes[check.snaAttemptsErrorCodes.length - 1]
        .code === 60519
    ) {
      response.setStatusCode(400);
      response.setBody({
        message: 'SNA Verification Result Pending',
        errorCode: 60519,
      });
    } else {
      response.setStatusCode(200);
      response.setBody({
        success: false,
        message: 'SNA verification unsuccessful, phone number not verified',
        errorCode:
          check.snaAttemptsErrorCodes[check.snaAttemptsErrorCodes.length - 1]
            .code,
      });
      await checkVerification(check.to, 'not-verified');
    }
    return callback(null, response);
  } catch (error) {
    const errorCode = error.code;
    const statusCode = error.status || 400;
    response.setStatusCode(statusCode);
    if (statusCode === 404 && errorCode === 20404) {
      response.setBody({
        message:
          'No verification was found for the entered phone number. You have to execute the Create Verification request first.',
        errorCode: error.code,
      });
    } else {
      response.setBody({
        message: error.message,
      });
    }
    return callback(null, response);
  }
};
