exports.handler = async function (context, event, callback) {
  let finalData = null;
  let resp = null;
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  if (event.request.headers.authorization !== process.env.Password) {
    finalData = { er: 0 };
    return callback(null, finalData);
  }

  try {
    const client = require('twilio')(accountSid, authToken, {
      accountSid: event.laccount,
    });

    resp = await client
      .incomingPhoneNumbers(event.phone) // number SID
      .update({
        accountSid: event.gaccount,
        bundleSid: event.bSID,
        addressSid: event.aSID,
      }); // account sid where the number should be transferred to

    response.setStatusCode(200);
    response.setBody(resp);
    return callback(null, response);
  } catch (error) {
    console.error(error.message);
    response.setStatusCode(error.status || 400);
    response.setBody({ error: error.message });
    return callback(null, response);
  }
};
