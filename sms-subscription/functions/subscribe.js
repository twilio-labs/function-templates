const { storePhoneNumber } = require(Runtime.getAssets()['/data.js'].path);

exports.handler = async function (context, event, callback) {
  const { phoneNumber } = event;

  const success = await storePhoneNumber(phoneNumber);
  if (success) {
    return callback(null, { status: 'subscribed' });
  }
  return callback(null, { status: 'already-subscribed' });
};
