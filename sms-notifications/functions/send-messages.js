/* eslint-disable no-negated-condition */
// eslint-disable-next-line consistent-return
exports.handler = function (context, event, callback) {
  const { message, recipients } = event;
  const { auth } = require('@twilio-labs/runtime-helpers');

  if (!auth.isAuthenticated(context, event)) {
    const response = new Twilio.Response();
    response.setBody({ success: false, error: 'INVALID CREDENTIALS' });
    response.setStatusCode(401);
    return callback(null, response);
  }

  const isTesting =
    context.TESTMODE !== undefined ? context.TESTMODE === 'true' : true;
  console.log(`Is test Mode ${context.TESTMODE} ${isTesting}`);

  let client = context.getTwilioClient();
  let from = context.TWILIO_PHONE_NUMBER;

  if (isTesting) {
    client = require('twilio')(
      context.TEST_ACCOUNT_SID,
      context.TEST_AUTH_TOKEN
    );
    from = '+15005550006';
    console.log(`In Test Mode using ${from}`);
  } else {
    console.log(`*****!!!!!!!In PRODUCTION mode!!!!!!!*****`);
  }

  const allMessageRequests = recipients.map((recipient) => {
    let msgBody = message;
    recipient.parameters.filter((param, idx) => {
      msgBody = msgBody.replace(`{${idx}}`, param);
      return true;
    });
    console.log(`Sending message to ${recipient.number} with body ${msgBody}`);

    return client.messages
      .create({
        from,
        to: recipient.number,
        body: msgBody,
      })
      .then((msg) => {
        console.log(
          `Message sent [${msg.sid}] ${msg.from} ${msg.to} with message ${msg.body}`
        );
        return { success: true, sid: msg.sid, to: msg.to, body: msg.body };
      })
      .catch((err) => {
        const numberList = err.message.match(/\+[0-9]+/g) || [];
        const toNumber = numberList.length > 0 ? numberList[0] : 'unknown';
        console.log(
          `Message failed for ${toNumber} or ${recipient.number} [${err.code} ${err.message}]`
        );
        return { success: false, error: err.message, to: toNumber };
      });
  });

  Promise.all(allMessageRequests)
    .then((result) => {
      return callback(null, { result, requestId: event.requestId });
    })
    .catch((err) => {
      console.error(err);
      return callback('Failed to fetch messages');
    });
};
