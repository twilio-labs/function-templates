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

const assets = Runtime.getAssets();
const { connectToDatabaseAndRunQueries } = require(assets['/helpers/db.js']
  .path);

/**
 * Removes records from the verifications table that are more than 30 minutes old
 * @param {sqlite3.Database} db A sqlite3 Database object
 * @param {Twilio.Response} response A Twilio Response object
 * @param {Function} callback A callback function
 */
function removeRecords(db, response, callback, verification) {
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
      response.setStatusCode(200);
      response.setBody({
        message: 'Records removed successfully',
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
    connectToDatabaseAndRunQueries(removeRecords, callback, response);
  } catch (error) {
    const statusCode = error.status || 400;
    response.setStatusCode(statusCode);
    response.setBody({
      message: error.message,
    });
    return callback(null, response);
  }
};
