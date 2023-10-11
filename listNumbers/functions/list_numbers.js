exports.handler = async function (context, event, callback) {
  let finalData = null;
  let resp = null;
  let pageResp=null;
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  const subAccount = event.subAcc;
  const password = event.pass;
  const client = require("twilio")(accountSid, authToken, {
    accountSid: subAccount,
  });

  const response = new Twilio.Response();

  if (password !== process.env.Password) {
    finalData = { er: 0 };
    return callback(null, finalData);
  } else if (event.pageSize > 0) {
      pageResp = await client.incomingPhoneNumbers.page({
      pageSize: event.pageSize,
      Page: event.page,
      pageToken: event.pageToken,
    });

    return callback(null, pageResp);
  }

  try {
    resp = await client.incomingPhoneNumbers.list();
    return callback(null, resp);
  } catch (error) {
    console.error(error.message);
    response.setStatusCode(error.status || 400);
    response.setBody({ error: error.message });
    return callback(null, response);
  }
};
