const { getAllPhoneNumbers } = require(Runtime.getAssets()['/data.js'].path);
const { isAuthenticated } = require(Runtime.getAssets()['/auth.js'].path);

exports.handler = async function (context, event, callback) {
  if (!isAuthenticated(context, event)) {
    const response = new Twilio.Response();
    response.setBody({ error: 'INVALID' });
    response.setStatusCode(401);
    return callback(null, response);
  }

  const phoneNumbers = await getAllPhoneNumbers();

  const allMessages = phoneNumbers.map((num) => {
    return context
      .getTwilioClient()
      .messages.create({
        from: context.TWILIO_PHONE_NUMBER,
        to: num,
        body: 'Hey this is the notification you asked for.',
      })
      .then((msg) => msg.sid)
      .catch((err) => console.error(err.message) && null);
  });

  const result = await Promise.all(allMessages);

  return callback(null, { result });
};
