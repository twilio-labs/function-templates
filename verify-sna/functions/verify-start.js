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

const fs = require('fs');
const path = require('path');
const os = require('os');
const sqlite3 = require('sqlite3');

const assets = Runtime.getAssets();
const {
  connectToDatabaseAndRunQueries,
  verificationStartDatabaseUpdate,
} = require(assets['/helpers/db.js'].path);

// eslint-disable-next-line consistent-return
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    const client = context.getTwilioClient();
    const service = context.VERIFY_SERVICE_SID;

    const [countryCode, phoneNumber] = [event.countryCode, event.phoneNumber];

    const verification = await client.verify
      .services(service)
      .verifications.create({
        to: `${countryCode}${phoneNumber}`,
        channel: 'sna',
      });

    response.setStatusCode(200);
    response.setBody({
      message: 'Creation of SNA verification successful',
      snaUrl: verification.sna.url,
    });
    const dbResponse = await connectToDatabaseAndRunQueries(
      verificationStartDatabaseUpdate,
      response,
      verification
    );
    return callback(null, dbResponse);
  } catch (error) {
    const statusCode = error.status || 400;
    response.setStatusCode(statusCode);
    response.setBody({
      message: error.message,
    });
    return callback(null, response);
  }
};
