exports.handler = async function (context, event, callback) {
  let finalData = null;
  let resp = null;
  let pageResp = null;
  let str = '';
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  const subAccount = event.subAcc;
  const client = require('twilio')(accountSid, authToken, {
    accountSid: subAccount,
  });

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  if (event.request.headers.authorization !== process.env.Password) {
    finalData = { er: 0 };
    return callback(null, finalData);
  }
  try {
    if (event.number !== undefined) {
      pageResp = await client.incomingPhoneNumbers.list({
        limit: 1,
        phoneNumber: event.number,
      });

      str = JSON.stringify(pageResp).length;
      if (str < 3) {
        response.setStatusCode(200);
        response.setBody('number not found');
        return callback(null, response);
      }

      return callback(null, pageResp);
    } else if (event.pageSize > 0) {
      pageResp = await client.incomingPhoneNumbers.page({
        pageSize: event.pageSize,
        Page: event.page,
        pageToken: event.pageToken,
      });

      return callback(null, pageResp);
    }
    aaa;
    resp = await client.incomingPhoneNumbers.list();
    return callback(null, resp);
  } catch (error) {
    console.error(error.message);
    response.setStatusCode(error.status || 400);
    response.setBody({ error: error.message });
    return callback(null, response);
  }
};
