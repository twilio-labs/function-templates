const assets = Runtime.getAssets();
const { origins } = require(assets['/origins.js'].path);

exports.handler = function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  response.setBody({ origins: origins(context) });

  return callback(null, response);
};
