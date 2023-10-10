exports.handler = async function (context, event, callback) {
  const accountSid = { acc: process.env.ACCOUNT_SID };
  const password = event.pass;

  if (password !== process.env.Password) {
    let finalData = { er: 0 };
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
