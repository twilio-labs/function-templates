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

const fs = require('fs');
const path = require('path');
const os = require('os');
const sqlite3 = require('sqlite3');

const assets = Runtime.getAssets();
const {
  connectToDatabaseAndRunQueries,
  verificationCheckDatabaseUpdate,
} = require(assets['/helpers/db.js'].path);

// eslint-disable-next-line consistent-return
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    const client = context.getTwilioClient();
    const service = context.VERIFY_SERVICE_SID;

    const [countryCode, phoneNumber] = [event.countryCode, event.phoneNumber];

    const check = await client.verify
      .services(service)
      .verificationChecks.create({ to: `${countryCode}${phoneNumber}` });

    if (check.status === 'approved') {
      response.setStatusCode(200);
      response.setBody({
        success: true,
        message: 'SNA verification successful, phone number verified',
      });
      const dbResponse = await connectToDatabaseAndRunQueries(
        verificationCheckDatabaseUpdate,
        response,
        check,
        true
      );
      return callback(null, dbResponse);
    } else {
      if (
        check.snaAttemptsErrorCodes[check.snaAttemptsErrorCodes.length - 1]
          .code === 60519
      ) {
        response.setStatusCode(400);
        response.setBody({
          message: 'SNA Verification Result Pending',
          errorCode: 60519,
        });
        return callback(null, response);
      } else {
        response.setStatusCode(200);
        response.setBody({
          success: false,
          message: 'SNA verification unsuccessful, phone number not verified',
          errorCode:
            check.snaAttemptsErrorCodes[check.snaAttemptsErrorCodes.length - 1]
              .code,
        });
        const dbResponse = await connectToDatabaseAndRunQueries(
          verificationCheckDatabaseUpdate,
          response,
          check,
          false
        );
        return callback(null, dbResponse);
      }
    }
  } catch (error) {
    const statusCode = error.status || 400;
    response.setStatusCode(statusCode);
    response.setBody({
      message: error.message,
    });
    return callback(null, response);
  }
};
