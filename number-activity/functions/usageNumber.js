exports.handler = async function (context, event, callback) {
  let finalData = null;
  let inboundSMS = null;
  let outboundSMS = null;
  let inboundCall = null;
  let outboundCall = null;
  let smsInboundUsage = null;
  let smsOutboundUsage = null;
  let whatsappInboundSMS = null;
  let whatsappInboundUsage = null;
  let whatsappOutboundSMS = null;
  let whatsappOutboundUsage = null;
  let callInboundUsage = null;
  let callOutboundUsage = null;
  let lim = Number(event.limit);
  let inboundSMSDate = null;
  let outboundSMSDate = null;
  let inboundCallDate = null;
  let outboundCallDate = null;
  let whatsappInboundSMSDate = null;
  let whatsappOutboundSMSDate = null;

  let wNumber = 'whatsapp:' + event.number;

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
    if (event.limit === undefined) {
      // SMS or MMS
      await client.messages
        .list({
          dateSentAfter: new Date(
            Date.UTC(
              event.startDate.split('-')[0],
              event.startDate.split('-')[1] - 1,
              event.startDate.split('-')[2],
              0,
              0,
              0
            )
          ),
          dateSentBefore: new Date(
            Date.UTC(
              event.endDate.split('-')[0],
              event.endDate.split('-')[1] - 1,
              event.endDate.split('-')[2],
              0,
              0,
              0
            )
          ),
          to: event.number,
        })
        .then((messages) => {
          for (let m in messages) {
            inboundSMS = messages[m].sid;
            smsInboundUsage = messages.length;
            inboundSMSDate = messages[m].dateCreated;
            break;
          }
        });

      await client.messages
        .list({
          dateSentAfter: new Date(
            Date.UTC(
              event.startDate.split('-')[0],
              event.startDate.split('-')[1] - 1,
              event.startDate.split('-')[2],
              0,
              0,
              0
            )
          ),
          dateSentBefore: new Date(
            Date.UTC(
              event.endDate.split('-')[0],
              event.endDate.split('-')[1] - 1,
              event.endDate.split('-')[2],
              0,
              0,
              0
            )
          ),
          from: event.number,
        })
        .then((messages) => {
          for (let m in messages) {
            outboundSMS = messages[m].sid;
            smsOutboundUsage = messages.length;
            outboundSMSDate = messages[m].dateCreated;
            break;
          }
        });

      // Whatsapp
      await client.messages
        .list({
          dateSentAfter: new Date(
            Date.UTC(
              event.startDate.split('-')[0],
              event.startDate.split('-')[1] - 1,
              event.startDate.split('-')[2],
              0,
              0,
              0
            )
          ),
          dateSentBefore: new Date(
            Date.UTC(
              event.endDate.split('-')[0],
              event.endDate.split('-')[1] - 1,
              event.endDate.split('-')[2],
              0,
              0,
              0
            )
          ),
          to: wNumber,
        })
        .then((messages) => {
          for (let m in messages) {
            whatsappInboundSMS = messages[m].sid;
            whatsappInboundUsage = messages.length;
            whatsappInboundSMSDate = messages[m].dateCreated;
            break;
          }
        });

      await client.messages
        .list({
          dateSentAfter: new Date(
            Date.UTC(
              event.startDate.split('-')[0],
              event.startDate.split('-')[1] - 1,
              event.startDate.split('-')[2],
              0,
              0,
              0
            )
          ),
          dateSentBefore: new Date(
            Date.UTC(
              event.endDate.split('-')[0],
              event.endDate.split('-')[1] - 1,
              event.endDate.split('-')[2],
              0,
              0,
              0
            )
          ),
          from: wNumber,
        })
        .then((messages) => {
          for (let m in messages) {
            whatsappOutboundSMS = messages[m].sid;
            whatsappOutboundUsage = messages.length;
            whatsappOutboundSMSDate = messages[m].dateCreated;
            break;
          }
        });

      await client.calls
        .list({
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
          to: event.number,
        })
        .then((calls) => {
          for (let c in calls) {
            inboundCall = calls[c].sid;
            callInboundUsage = calls.length;
            inboundCallDate = calls[c].dateCreated;
            break;
          }
        });

      await client.calls
        .list({
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
          from: event.number,
        })
        .then((calls) => {
          for (let c in calls) {
            outboundCall = calls[c].sid;
            callOutboundUsage = calls.length;
            outboundCallDate = calls[c].dateCreated;
            break;
          }
        });

      finalData = {
        0: inboundSMS,
        1: inboundSMSDate,
        2: outboundSMS,
        3: outboundSMSDate,
        4: whatsappInboundSMS,
        5: whatsappInboundSMSDate,
        6: whatsappOutboundSMS,
        7: whatsappOutboundSMSDate,
        8: inboundCall,
        9: inboundCallDate,
        10: outboundCall,
        11: outboundCallDate,
        12: smsInboundUsage,
        13: smsOutboundUsage,
        14: whatsappInboundUsage,
        15: whatsappOutboundUsage,
        16: callInboundUsage,
        17: callOutboundUsage,
      };

      console.log(finalData);
      return callback(null, finalData);
    } else {
      await client.messages
        .list({
          dateSentAfter: new Date(
            Date.UTC(
              event.startDate.split('-')[0],
              event.startDate.split('-')[1] - 1,
              event.startDate.split('-')[2],
              0,
              0,
              0
            )
          ),
          dateSentBefore: new Date(
            Date.UTC(
              event.endDate.split('-')[0],
              event.endDate.split('-')[1] - 1,
              event.endDate.split('-')[2],
              0,
              0,
              0
            )
          ),
          to: event.number,
          limit: lim,
        })
        .then((messages) => {
          for (let m in messages) {
            inboundSMS = messages[m].sid;
            smsInboundUsage = messages.length;
            inboundSMSDate = messages[m].dateCreated;
            break;
          }
        });

      await client.messages
        .list({
          dateSentAfter: new Date(
            Date.UTC(
              event.startDate.split('-')[0],
              event.startDate.split('-')[1] - 1,
              event.startDate.split('-')[2],
              0,
              0,
              0
            )
          ),
          dateSentBefore: new Date(
            Date.UTC(
              event.endDate.split('-')[0],
              event.endDate.split('-')[1] - 1,
              event.endDate.split('-')[2],
              0,
              0,
              0
            )
          ),
          from: event.number,
          limit: lim,
        })
        .then((messages) => {
          for (let m in messages) {
            outboundSMS = messages[m].sid;
            smsOutboundUsage = messages.length;
            outboundSMSDate = messages[m].dateCreated;
            break;
          }
        });

      // Whatsapp
      await client.messages
        .list({
          dateSentAfter: new Date(
            Date.UTC(
              event.startDate.split('-')[0],
              event.startDate.split('-')[1] - 1,
              event.startDate.split('-')[2],
              0,
              0,
              0
            )
          ),
          dateSentBefore: new Date(
            Date.UTC(
              event.endDate.split('-')[0],
              event.endDate.split('-')[1] - 1,
              event.endDate.split('-')[2],
              0,
              0,
              0
            )
          ),
          to: wNumber,
          limit: lim,
        })
        .then((messages) => {
          for (let m in messages) {
            whatsappInboundSMS = messages[m].sid;
            whatsappInboundUsage = messages.length;
            whatsappInboundSMSDate = messages[m].dateCreated;
            break;
          }
        });

      await client.messages
        .list({
          dateSentAfter: new Date(
            Date.UTC(
              event.startDate.split('-')[0],
              event.startDate.split('-')[1] - 1,
              event.startDate.split('-')[2],
              0,
              0,
              0
            )
          ),
          dateSentBefore: new Date(
            Date.UTC(
              event.endDate.split('-')[0],
              event.endDate.split('-')[1] - 1,
              event.endDate.split('-')[2],
              0,
              0,
              0
            )
          ),
          from: wNumber,
          limit: lim,
        })
        .then((messages) => {
          for (let m in messages) {
            whatsappOutboundSMS = messages[m].sid;
            whatsappOutboundUsage = messages.length;
            whatsappOutboundSMSDate = messages[m].dateCreated;
            break;
          }
        });

      // Calls
      await client.calls
        .list({
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
          to: event.number,
          limit: lim,
        })
        .then((calls) => {
          for (let c in calls) {
            inboundCall = calls[c].sid;
            callInboundUsage = calls.length;
            inboundCallDate = calls[c].dateCreated;
            break;
          }
        });

      await client.calls
        .list({
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
          from: event.number,
          limit: lim,
        })
        .then((calls) => {
          for (let c in calls) {
            outboundCall = calls[c].sid;
            callOutboundUsage = calls.length;
            outboundCallDate = calls[c].dateCreated;
            break;
          }
        });

      finalData = {
        0: inboundSMS,
        1: inboundSMSDate,
        2: outboundSMS,
        3: outboundSMSDate,
        4: whatsappInboundSMS,
        5: whatsappInboundSMSDate,
        6: whatsappOutboundSMS,
        7: whatsappOutboundSMSDate,
        8: inboundCall,
        9: inboundCallDate,
        10: outboundCall,
        11: outboundCallDate,
        12: smsInboundUsage,
        13: smsOutboundUsage,
        14: whatsappInboundUsage,
        15: whatsappOutboundUsage,
        16: callInboundUsage,
        17: callOutboundUsage,
      };

      console.log(finalData);
      return callback(null, finalData);
    }
  } catch (error) {
    console.error(error.message);
    response.setStatusCode(error.status || 400);
    response.setBody({ error: error.message });
    return callback(null, response);
  }
};
