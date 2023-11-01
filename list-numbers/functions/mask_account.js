exports.handler = async function (context, event, callback) {
  let masked =
    ("" + process.env.ACCOUNT_SID).slice(0, 28).replace(/./g, "*") + ("" + process.env.ACCOUNT_SID).slice(-6);
  const accountSid = { acc: masked };

  try {
    return callback(null, accountSid);
  } catch (error) {
    console.error(error.message);
    response.setStatusCode(error.status || 400);
    response.setBody({ error: error.message });
    return callback(null, response);
  }
};
