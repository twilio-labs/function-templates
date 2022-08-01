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
 *      "status": string
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

/**
 * Updates verifications table when a verification check occurs
 * @param {sqlite3.Database} db A sqlite3 Database object
 * @param {Object} check The object returned by the Twilio Verify API when checking a SNA verification for a phone number
 * @param {Twilio.Response} response A Twilio Response object
 * @param {Function} callback A callback function
 */
function verificationCheckDatabaseUpdate(db, check, response, callback) {
  db.all(
    `
    SELECT *
    FROM verifications
    WHERE phone_number = ?;
    `,
    check.to,
    (err, rows) => {
      if (err) {
        const statusCode = err.status || 400;
        response.setStatusCode(statusCode);
        response.setBody({
          message: err.message,
        });
        return callback(null, response);
      }

      if (rows.length > 0) {
        pendingStatusRows = rows.filter((row) => row.status === 'pending');
        if (pendingStatusRows.length > 0) {
          sortedRows = pendingStatusRows.sort((a, b) => {
            const aDate = new Date(a.verification_start_datetime);
            const bDate = new Date(b.verification_start_datetime);
            return bDate - aDate;
          });
          db.run(
            `
                UPDATE verifications
                SET status = ?, verification_check_datetime = DATETIME('NOW')
                WHERE phone_number = ? AND sna_url = ?;
                `,
            [response.body.status, check.to, sortedRows[0].sna_url],
            (err) => {
              if (err) {
                const statusCode = err.status || 400;
                response.setStatusCode(statusCode);
                response.setBody({
                  message: err.message,
                });
                return callback(null, response);
              }
              db.run(
                `
                    UPDATE verifications
                    SET status = ?, verification_check_datetime = DATETIME('NOW')
                    WHERE phone_number = ? AND sna_url != ?;
                    `,
                ['expired', check.to, sortedRows[0].sna_url],
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
            }
          );
        } else {
          return callback(null, response);
        }
      } else {
        db.run(
          `
            INSERT INTO verifications (phone_number, sna_url, status, verification_start_datetime, verification_check_datetime)
            VALUES (?, ?, ?, NULL, DATETIME('NOW'));
            `,
          [check.to, 'no sna url generated', response.body.status],
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

    const check = await client.verify.v2
      .services(service)
      .verificationChecks.create({ to: `${countryCode}${phoneNumber}` });

    if (check.status === 'approved') {
      response.setStatusCode(200);
      response.setBody({
        status: 'verified',
        message: 'SNA verification successful, phone number verified',
      });
    } else {
      if (
        check.snaAttemptsErrorCodes[check.snaAttemptsErrorCodes.length - 1]
          .code === 60519 ||
        check.snaAttemptsErrorCodes[check.snaAttemptsErrorCodes.length - 1]
          .code > 60520
      ) {
        response.setStatusCode(200);
        response.setBody({
          status: 'pending',
          message: 'Pending EVURL processing',
        });
      } else {
        response.setStatusCode(200);
        response.setBody({
          status: 'not-verified',
          message: 'SNA verification unsuccessful, phone number not verified',
        });
      }
    }

    if (response.body.status !== 'pending') {
      // Connecting to database and running queries
      const dbName = 'verifications_db.db';
      const db = new sqlite3.Database(
        path.join(os.tmpdir(), dbName),
        sqlite3.OPEN_READWRITE,
        (err) => {
          if (err && err.code === 'SQLITE_CANTOPEN') {
            // Create database
            const newdb = new sqlite3.Database(
              path.join(os.tmpdir(), dbName),
              (err) => {
                if (err) {
                  const statusCode = err.status || 400;
                  response.setStatusCode(statusCode);
                  response.setBody({
                    message: err.message,
                  });
                  return callback(null, response);
                }
                // Table(s) creation
                newdb.exec(
                  `
                        CREATE TABLE verifications (
                            phone_number VARCHAR(30) NOT NULL,
                            sna_url VARCHAR(500) NOT NULL,
                            status VARCHAR(10) NOT NULL,
                            verification_start_datetime DATETIME,
                            verification_check_datetime DATETIME,
                            PRIMARY KEY (phone_number, sna_url)
                        );
                        `,
                  (err) => {
                    if (err) {
                      const statusCode = err.status || 400;
                      response.setStatusCode(statusCode);
                      response.setBody({
                        message: err.message,
                      });
                      return callback(null, response);
                    }
                    verificationCheckDatabaseUpdate(
                      newdb,
                      check,
                      response,
                      callback
                    );
                  }
                );
              }
            );
          } else if (err) {
            const statusCode = err.status || 400;
            response.setStatusCode(statusCode);
            response.setBody({
              message: err.message,
            });
            return callback(null, response);
          }
          verificationCheckDatabaseUpdate(db, check, response, callback);
        }
      );
    } else {
      return callback(null, response);
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
