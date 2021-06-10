const assets = Runtime.getAssets();
const { checkAuthorization, createToken } = require(assets['/admin/shared.js']
  .path);

// eslint-disable-next-line consistent-return
exports.handler = function (context, event, callback) {
  // Create a token from the password, and use it to check by setting it
  // eslint-disable-next-line no-multi-assign
  const token = (event.token = createToken(context, event.password));
  // Short-circuits
  if (checkAuthorization(context, event, callback)) {
    return callback(null, { token });
  }
};
