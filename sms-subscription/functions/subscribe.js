exports.handler = async function (context, event, callback) {
  const { storePhoneNumber } = require(Runtime.getAssets()['/data.js'].path);

  const { phoneNumber } = event;

  if (!phoneNumber) {
    const response = new Twilio.Response();
    response.setBody({ error: 'Missing phoneNumber parameter' });
    response.setStatusCode(404);
    return callback(null, response);
  }

  try {
    const success = await storePhoneNumber(phoneNumber);
    if (success) {
      return callback(null, { status: 'subscribed' });
    }
    return callback(null, { status: 'already-subscribed' });
  } catch (err) {
    console.error(err.message);
    return callback(new Error('Server error. Please check logs.'));
  }
};
