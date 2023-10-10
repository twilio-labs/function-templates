exports.handler = async function (context, event, callback) {
  const accountSid = { acc: process.env.ACCOUNT_SID };

  try {
    return callback(null, accountSid);
  } catch (error) {
    console.error(error.message);
    response.setStatusCode(error.status || 400);
    response.setBody({ error: error.message });
    return callback(null, response);
  }
};
