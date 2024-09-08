exports.handler = function(context, event, callback) {
  const assets = Runtime.getAssets();
  const privateMessageAsset = assets['/message.js'];
  const privateMessagePath = privateMessageAsset.path;
  const privateMessage = require(privateMessagePath);
  const twiml = new Twilio.twiml.MessagingResponse();
  twiml.message(privateMessage());
  callback(null, twiml);
};
