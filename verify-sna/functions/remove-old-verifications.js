/**
 * Remove locally stored verifications
 *
 * Removes locally stored verifications that are more than 30 minutes old from creation
 *
 * Returns JSON
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
    response.setStatusCode(200);
    response.setBody({
      message: 'No records were removed',
    });

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
             WHERE DATETIME(verification_start_datetime, '+30 minute') < DATETIME('NOW') OR DATETIME(verification_check_datetime, '+30 minute') < DATETIME('NOW');
             `,
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
            response.setStatusCode(200);
            response.setBody({
              message: `At least ${rows.length} records were removed`,
            });

            db.run(
              `
                     DELETE
                     FROM verifications
                     WHERE DATETIME(verification_start_datetime, '+30 minute') < DATETIME('NOW') OR DATETIME(verification_check_datetime, '+30 minute') < DATETIME('NOW');
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
                return callback(null, response);
              }
            );
          } else {
            return callback(null, response);
          }
        }
      );
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
