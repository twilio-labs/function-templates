const crypto = require('crypto');
const path = require('path');

// Change the salt to invalidate tokens
const SALT = 'salty';

// Creates a token for client side usage
function createToken(context, password) {
  const tokenString = `${context.ACCOUNT_SID}:${password}:${SALT}`;
  // Similar to TwilioClient
  return crypto
    .createHmac('sha1', context.AUTH_TOKEN)
    .update(Buffer.from(tokenString, 'utf-8'))
    .digest('base64');
}

function isAllowed(context, token) {
  // Create the token with the environment password
  const masterToken = createToken(context, process.env.ADMIN_PASSWORD);
  return masterToken === token;
}

// Shortcuts by calling the callback with an error
function checkAuthorization(context, event, callback) {
  if (!isAllowed(context, event.token)) {
    const response = new Twilio.Response();
    response.setStatusCode(403);
    response.setBody('Not authorized');
    callback(null, response);
    return false;
  }
  return true;
}

function urlForSiblingPage(newPage, ...paths) {
  const url = path.resolve(...paths);
  const parts = url.split('/');
  parts.pop();
  parts.push(newPage);
  return parts.join('/');
}

module.exports = {
  checkAuthorization,
  createToken,
  urlForSiblingPage,
};
