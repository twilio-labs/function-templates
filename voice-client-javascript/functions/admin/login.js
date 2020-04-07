const assets = Runtime.getAssets();
const { checkAuthorization, createToken } = require(assets["/admin/shared.js"].path);

exports.handler = function (context, event, callback) {
  // Create a token from the password, and use it to check by setting it
  const token = event.token = createToken(context, event.password);
  // Short-circuits
  const isAuthorized = checkAuthorization(context, event, callback);
  if (isAuthorized === true) {
    return callback(null, { token });
  }
};
