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

// eslint-disable-next-line consistent-return
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    const client = context.getTwilioClient();
    const service = context.VERIFY_SERVICE_SID;

    const [countryCode, phoneNumber] = [event.countryCode, event.phoneNumber];

    // TODO: Check that country code and phone number are present and correct

    /**
     * const check = await client.verify
     * .services(service)
     * .verificationChecks
     * .create({to: `+${countryCode}${phoneNumber}`});
     */

    const check = {
      to: `+${countryCode}${phoneNumber}`,
      status: 'approved',
      sna_attempts_error_codes: [
        {
          attempt_sid: 'VLXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          code: 60519,
        },
        {
          attempt_sid: 'VLYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
          code: 60500, // Here the Twilio error code points to a "denied verification error"
        },
      ],
    };

    if (check.status === 'approved') {
      response.setStatusCode(200);
      response.setBody({
        status: 'verified',
        message: 'SNA verification successful, phone number verified',
      });
    } else {
      if (
        check.sna_attempts_error_codes[
          check.sna_attempts_error_codes.length - 1
        ].code === 60519
      ) {
        response.setStatusCode(200);
        response.setBody({
          status: 'pending',
          message: 'Pending EVURL processing',
        });
      } else if (
        check.sna_attempts_error_codes[
          check.sna_attempts_error_codes.length - 1
        ].code <= 60520
      ) {
        response.setStatusCode(200);
        response.setBody({
          status: 'not-verified',
          message: 'SNA verification unsuccessful, phone number not verified',
        }); // Here I'm assuming the evurl can't be used any longer and a new one has to be generated
      } else {
        response.setStatusCode(200);
        response.setBody({
          status: 'pending',
          message: 'Pending EVURL processing',
        }); // Here I'm assuming that the sna url can be called afterward to potentially achieve a verified status
      }
    }

    if (response.body.status != 'pending') {
      // Connecting to database
      const dbName = 'verifications_db.db';
      let db = new sqlite3.Database(
        path.join(os.tmpdir(), dbName),
        sqlite3.OPEN_READWRITE,
        (err) => {
          if (err && err.code == 'SQLITE_CANTOPEN') {
            // Create database
            let newdb = new sqlite3.Database(
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
                    runQueries(newdb);
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
          runQueries(db);
        }
      );

      // Run queries in database
      function runQueries(db) {
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
              /**
               * Note: The most recent pending verification is updated to the status indicated by response.body.status, while the remaining pending verifications are updated to expired status
               */
              pendingStatusRows = rows.filter((row) => row.status == 'pending');
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
