exports.handler = async function (context, event, callback) {
  const { getAllPhoneNumbers } = require(Runtime.getAssets()['/data.js'].path);
  const { isAuthenticated } = require(Runtime.getAssets()['/auth.js'].path);

  if (!isAuthenticated(context, event)) {
    const response = new Twilio.Response();
    response.setBody({ error: 'INVALID' });
    response.setStatusCode(401);
    return callback(null, response);
  }

  let phoneNumbers;
  try {
    phoneNumbers = await getAllPhoneNumbers();
  } catch (err) {
    return callback(new Error('Server error. Please check logs.'));
  }

  if (!Array.isArray(phoneNumbers)) {
    console.log('Phone numbers is not an array.');
    return callback(new Error('Server error. Please check logs.'));
  }

  const allMessages = phoneNumbers.map((num) => {
    return context
      .getTwilioClient()
      .messages.create({
        from: context.TWILIO_PHONE_NUMBER,
        to: num,
        body: 'Hey this is the notification you asked for.',
      })
      .then((msg) => msg.sid)
      .catch((err) => {
        console.error(err.message);
        return null;
      });
  });

  const result = await Promise.all(allMessages);

  return callback(null, { result });
};
