/**
 * Retrieve locally stored verifications
 *
 * Retrieves all locally stored verifications
 *
 * Returns JSON
 *
 * on Success:
 * {
 *      "message": string
 *      "verifications": {phone_number: string, sna_url: string, status: string, verification_start_datetime: string | null, verification_check_datetime: string | null} []
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
 * Fetchs all the records from the verifications table
 * @param {sqlite3.Database} db A sqlite3 Database object
 * @param {Twilio.Response} response A Twilio Response object
 * @param {Function} callback A callback function
 */
function getVerifications(db, response, callback) {
  db.all(
    `
    SELECT *
    FROM verifications;
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
      response.setStatusCode(200);
      response.setBody({
        message: 'Verifications retrieved sucessfully',
        verifications: rows,
      });
      return callback(null, response);
    }
  );
}

// eslint-disable-next-line consistent-return
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
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
                  getVerifications(newdb, response, callback);
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
        getVerifications(db, response, callback);
      }
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
