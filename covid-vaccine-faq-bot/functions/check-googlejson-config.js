const fs = require('fs').promises;
const path = require('path');

const isAuthValid = function isAuthValid(authJson) {
  return (
    authJson.client_email &&
    authJson.client_email === '<YOUR SERVICE ACCOUNT EMAIL ADDRESS>' &&
    authJson.private_key &&
    authJson.private_key === '<YOUR PRIVATE KEY BLOCK HERE>'
  );
};

exports.handler = async function (context, _event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    const filename =
      Runtime.getAssets()[context.GOOGLE_APPLICATION_CREDENTIALS].path;
    const authJson = JSON.parse(await fs.readFile(filename));

    if (!isAuthValid(authJson)) {
      throw new Error('Invalid authentication JSON file');
    }

    response.setStatusCode(200);
    response.setBody({
      success: true,
      message: 'Google service account key is configured properly.',
    });
    return callback(null, response);
  } catch (error) {
    console.error(`Google service account key error: ${error.message}.`);
  }

  response.setStatusCode(error.code || 400);
  response.setBody({
    success: false,
    message,
  });
  return callback(null, response);
};
