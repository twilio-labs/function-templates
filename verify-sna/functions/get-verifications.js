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

const assets = Runtime.getAssets();
const { connectToDatabaseAndRunQueries } = require(assets['/helpers/db.js']
  .path);

/**
 * Fetchs all the records from the verifications table
 * @param {sqlite3.Database} db A sqlite3 Database object
 * @param {Twilio.Response} response A Twilio Response object
 * @param {Function} callback A callback function
 */
function getVerifications(db, response, callback, verification) {
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
      sortedRows = rows.sort((a, b) => {
        const aDate = new Date(a.verification_start_datetime);
        const bDate = new Date(b.verification_start_datetime);
        return bDate - aDate;
      });
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
    connectToDatabaseAndRunQueries(getVerifications, callback, response);
  } catch (error) {
    const statusCode = error.status || 400;
    response.setStatusCode(statusCode);
    response.setBody({
      message: error.message,
    });
    return callback(null, response);
  }
};
