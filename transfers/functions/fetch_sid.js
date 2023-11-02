exports.handler = async function (context, event, callback) {
  let finalData = null;
  let sSid = null;
  let pNum = null;
  let numStatus = null;
  let addReq = null;
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken, {
    accountSid: event.sub,
  });

  const response = new Twilio.Response();

  response.appendHeader('Content-Type', 'application/json');

  if (event.request.headers.authorization !== process.env.Password) {
    finalData = { er: 0 };
    return callback(null, finalData);
  }

  try {
    await client.incomingPhoneNumbers
      .list({ phoneNumber: event.phone })
      .then((incomingPhoneNumbers) =>
        incomingPhoneNumbers.forEach((k) => {
          pNum = k.phoneNumber;
          sSid = k.sid;
          numStatus = k.status;
          addReq = k.addressRequirements;
        })
      );

    if (pNum !== null) {
      finalData = {
        Acc: event.sub,
        pnumber: pNum,
        SID: sSid,
        status: numStatus,
        addressReq: addReq,
      };
      response.setStatusCode(200);
      response.setBody(finalData);
      return callback(null, response);
    }
    response.setStatusCode(200);
    response.setBody('not here');
    return callback(null, response);
  } catch (error) {
    console.error(error.message);
    response.setStatusCode(error.status || 400);
    response.setBody({ error: error.message });
    return callback(null, response);
  }
};
