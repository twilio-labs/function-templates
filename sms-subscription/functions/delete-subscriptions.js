exports.handler = async function (context, event, callback) {
  const { deleteAllPhoneNumbers } = require(Runtime.getAssets()['/data.js']
    .path);
  const { isAuthenticated } = require(Runtime.getAssets()['/auth.js'].path);

  if (!isAuthenticated(context, event)) {
    const response = new Twilio.Response();
    response.setBody({ error: 'INVALID' });
    response.setStatusCode(401);
    return callback(null, response);
  }

  try {
    const result = await deleteAllPhoneNumbers();

    return callback(null, { result });
  } catch (err) {
    console.error(err.message);
    return callback(new Error('Server error. Please check logs.'));
  }
};
