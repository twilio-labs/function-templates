const crypto = require('crypto');

// eslint-disable-next-line func-names
exports.handler = function (context, event, callback) {
  // Create a token from the password, and use it to check by setting it
  function createToken(password) {
    const tokenString = `${context.ACCOUNT_SID}:${password}:${context.SALT}`;

    return crypto
      .createHmac('sha1', context.AUTH_TOKEN)
      .update(Buffer.from(tokenString, 'utf-8'))
      .digest('base64');
  }

  function isAllowed(token) {
    // Create the token with the environment password
    const masterToken = createToken(context.ADMIN_PASSWORD);
    return masterToken === token;
  }

  const token = createToken(event.password);
  // Short-circuits

  if (isAllowed(token)) {
    callback(null, { token });
  }

  // eslint-disable-next-line no-undef
  const response = new Twilio.Response();
  response.setStatusCode(403);
  response.setBody({ message: 'Unauthorized' });

  callback(null, response);
};
