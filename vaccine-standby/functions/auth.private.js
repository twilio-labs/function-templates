const crypto = require('crypto');

function createToken(password, context) {
  const tokenString = `${context.ACCOUNT_SID}:${password}:${context.SALT}`;

  return crypto
    .createHmac('sha1', context.AUTH_TOKEN)
    .update(Buffer.from(tokenString, 'utf-8'))
    .digest('base64');
}

function isAllowed(token, context) {
  // Create the token with the environment password
  const masterToken = createToken(context.ADMIN_PASSWORD, context);
  return masterToken === token;
}
