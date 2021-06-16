/* eslint-disable camelcase */
exports.handler = function (context, event, callback) {
  const phone_number = context.TWILIO_PHONE_NUMBER;
  const response = new Twilio.Response();
  response.setStatusCode(200);
  response.appendHeader('Content-Type', 'application/json');
  response.setBody({ phone_number });
  callback(null, response);
};
