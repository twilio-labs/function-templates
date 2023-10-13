exports.handler = async function (context, event, callback) {
  let phoneNumber = event.phone;
  let finalData = null;
  let allAccounts = [];
  let i = 0;
  let numAccounts = 1;
  let subA = null;
  let subClient = null;
  let sSid = null;
  let pNum = null;
  let numStatus = null;
  let addReq=null;
  let sub = null;
  let subResp = null;
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  const client = require("twilio")(accountSid, authToken);
  const password = event.pass;
  const response = new Twilio.Response();

  response.appendHeader("Content-Type", "application/json");

  if (password != process.env.Password) {
    finalData = { er: 0 };
    return callback(null, finalData);
  }

  try {
    sub = await client.api.v2010.accounts
      .list()
      .then((accounts) => accounts.forEach((a) => (allAccounts[i++] = a.sid)));

    numAccounts = allAccounts.length;
    try {
      for (let j = 0; j < numAccounts; j++) {
        subA = allAccounts[j].replace(/\"/g, "");

        subClient = require("twilio")(accountSid, authToken, {
          accountSid: subA,
        });

        subResp = await subClient.incomingPhoneNumbers
          .list({ phoneNumber: phoneNumber })
          .then((incomingPhoneNumbers) =>
            incomingPhoneNumbers.forEach((k) => {
              pNum = k.phoneNumber;
              sSid = k.sid;
              numStatus = k.status;
              addReq = k.addressRequirements;
            }),
          );

        finalData = {
          Acc: subA,
          pnumber: pNum,
          SID: sSid,
          status: numStatus,
          addressReq: addReq,
        };
        if (pNum != null) {
          response.setStatusCode(200);
          response.setBody(sSid);
          return callback(null, finalData);
        }
      }

      response.setStatusCode(200);
      response.setBody("number not found");
      return callback(null, response);
    } catch (error) {
      console.error(error.message);
      response.setStatusCode(error.status || 400);
      response.setBody({ error: error.message });
      return callback(null, response);
    }
  } catch (error) {
    console.error(error.message);
    response.setStatusCode(error.status || 400);
    response.setBody({ error: error.message });
    return callback(null, response);
  }
};
