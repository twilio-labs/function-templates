const { deleteAllPhoneNumbers } = require(Runtime.getAssets()['/data.js'].path);
const { isAuthenticated } = require(Runtime.getAssets()['/auth.js'].path);

exports.handler = async function (context, event, callback) {
  if (!isAuthenticated(context, event)) {
    const response = new Twilio.Response();
    response.setBody({ error: 'INVALID' });
    response.setStatusCode(401);
    return callback(null, response);
  }

  const result = await deleteAllPhoneNumbers();

  return callback(null, { result });
};
