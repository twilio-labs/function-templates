exports.handler = async function (context, event, callback) {
  let result = null;
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  const subAccount = event.subAcc;
  const client = require('twilio')(accountSid, authToken, {
    accountSid: subAccount,
  });

  const response = new Twilio.Response();

  if (event.request.headers.authorization !== process.env.Password) {
    finalData = { er: 0 };
    return callback(null, finalData);
  }

  try {
    result = await client.calls.page({
      startTimeAfter: new Date(
        Date.UTC(
          event.startDate.split('-')[0],
          event.startDate.split('-')[1] - 1,
          event.startDate.split('-')[2],
          0,
          0,
          0
        )
      ),
      startTimeBefore: new Date(
        Date.UTC(
          event.endDate.split('-')[0],
          event.endDate.split('-')[1] - 1,
          event.endDate.split('-')[2],
          0,
          0,
          0
        )
      ),
      pageSize: event.pageSize,
      Page: event.page,
      pageToken: event.pageToken,
    });

    return callback(null, result);
  } catch (error) {
    console.error(error.message);
    response.setStatusCode(error.status || 400);
    response.setBody({ error: error.message });
    return callback(null, response);
  }
};
