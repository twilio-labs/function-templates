// eslint-disable-next-line consistent-return
exports.handler = function (context, event, callback) {
  const phoneNumbers = event.recipients.split(',').map((x) => x.trim());
  const { message, passcode } = event;

  if (passcode !== context.PASSCODE) {
    const response = new Twilio.Response();
    response.setStatusCode(401);
    response.setBody('Invalid passcode');
    return callback(null, response);
  }

  const client = context.getTwilioClient();
  const allMessageRequests = phoneNumbers.map((to) => {
    return client.messages
      .create({
        from: context.TWILIO_PHONE_NUMBER,
        to,
        body: message,
      })
      .then((msg) => {
        return { success: true, sid: msg.sid };
      })
      .catch((err) => {
        return { success: false, error: err.message };
      });
  });

  Promise.all(allMessageRequests)
    .then((result) => {
      return callback(null, { result });
    })
    .catch((err) => {
      console.error(err);
      return callback('Failed to fetch messages');
    });
};
