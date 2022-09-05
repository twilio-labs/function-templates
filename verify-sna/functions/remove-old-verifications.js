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

const assets = Runtime.getAssets();
const { removeOldVerifications } = require(assets['/services/verifications.js']
  .path);

// eslint-disable-next-line consistent-return
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
  try {
    await removeOldVerifications();
    response.setStatusCode(200);
    response.setBody({
      message: 'Verifications removed successfully',
    });
    return callback(null, response);
  } catch (error) {
    const statusCode = error.status || 400;
    response.setStatusCode(statusCode);
    response.setBody({
      message: error.message,
    });
    return callback(null, response);
  }
};
