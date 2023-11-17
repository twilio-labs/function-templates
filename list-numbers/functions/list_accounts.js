exports.handler = async function (context, event, callback) {
  let finalData = null;
  let i = 0;

  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);
  const response = new Twilio.Response();
  const allAccounts = [];

  response.appendHeader('Content-Type', 'application/json');

  if (event.request.headers.authorization !== process.env.Password) {
    finalData = { er: 0 };
    return callback(null, finalData);
  }

  try {
    sub = await client.api.v2010.accounts.list().then((accounts) =>
      accounts.forEach((a) => {
        allAccounts[i] = a.sid;
        i += 1;
      })
    );

    response.setStatusCode(200);
    response.setBody(allAccounts);
    return callback(null, response);
  } catch (error) {
    console.error(error.message);
    response.setStatusCode(error.status || 400);
    response.setBody({ error: error.message });
    return callback(null, response);
  }
};
