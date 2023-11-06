exports.handler = async function (context, event, callback) {
  let finalData = null;
  const accountSid = { acc: process.env.ACCOUNT_SID };
  const authHeader = event.request.headers.authorization;

  if (authHeader !== process.env.Password) {
    finalData = { er: 0 };
    return callback(null, finalData);
  }

  try {
    return callback(null, accountSid);
  } catch (error) {
    console.error(error.message);
    response.setStatusCode(error.status || 400);
    response.setBody({ error: error.message });
    return callback(null, response);
  }
};
