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
const { connectToDatabaseAndRunQueries, getVerifications } = require(assets[
  '/helpers/db.js'
].path);

// eslint-disable-next-line consistent-return
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    return connectToDatabaseAndRunQueries(getVerifications, callback, response);
  } catch (error) {
    const statusCode = error.status || 400;
    response.setStatusCode(statusCode);
    response.setBody({
      message: error.message,
    });
    return callback(null, response);
  }
};
