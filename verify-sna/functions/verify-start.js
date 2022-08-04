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
const { connectToDatabaseAndRunQueries } = require(assets['/helpers/db.js']
  .path);

/**
 * Updates verifications table when a verification start occurs
 * @param {sqlite3.Database} db A sqlite3 Database object
 * @param {Twilio.Response} response A Twilio Response object
 * @param {Function} callback A callback function
 * @param {Object} verification The object returned by the Twilio Verify API when creating a SNA verification
 */
function verificationStartDatabaseUpdate(db, response, callback, verification) {
  db.get(
    `
     SELECT status
     FROM verifications
     WHERE phone_number = ? AND sna_url = ?;
     `,
    [verification.to, verification.sna.url],
    (err, row) => {
      if (err) {
        const statusCode = err.status || 400;
        response.setStatusCode(statusCode);
        response.setBody({
          message: err.message,
        });
        return callback(null, response);
      }
      if (!row) {
        db.run(
          `
             INSERT INTO verifications (phone_number, sna_url, status, verification_start_datetime, verification_check_datetime)
             VALUES (?, ?, 'pending', DATETIME('NOW'), NULL);
             `,
          [verification.to, verification.sna.url],
          (err) => {
            if (err) {
              const statusCode = err.status || 400;
              response.setStatusCode(statusCode);
              response.setBody({
                message: err.message,
              });
              return callback(null, response);
            }
            return callback(null, response);
          }
        );
      } else {
        return callback(null, response);
      }
    }
  );
}

// eslint-disable-next-line consistent-return
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    const client = context.getTwilioClient();
    const service = context.VERIFY_SERVICE_SID;

    const [countryCode, phoneNumber] = [event.countryCode, event.phoneNumber];

    const verification = await client.verify.v2
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
    connectToDatabaseAndRunQueries(
      verificationStartDatabaseUpdate,
      callback,
      response,
      verification
    );
  } catch (error) {
    const statusCode = error.status || 400;
    response.setStatusCode(statusCode);
    response.setBody({
      message: error.message,
    });
    return callback(null, response);
  }
};
