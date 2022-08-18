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
const { connectToDatabaseAndRunQueries, removeRecords } = require(assets[
  '/helpers/db.js'
].path);

// eslint-disable-next-line consistent-return
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    response.setStatusCode(200);
    response.setBody({
      message: 'Records removed successfully',
    });
    const dbResponse = await connectToDatabaseAndRunQueries(
      removeRecords,
      response
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
