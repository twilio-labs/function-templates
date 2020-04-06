const assets = Runtime.getAssets();
const { checkAuthorization, createToken } = require(assets["/admin/shared.js"].path);

exports.handler = function (context, event, callback) {
  // Create a token from the password, and use it to check
  const token = event.token = createToken(context, event.password);
  // Short-circuits
  checkAuthorization(context, event, callback);
  return callback(null, { token });
};
