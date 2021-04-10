// eslint-disable-next-line func-names
exports.handler = function (context, event, callback) {
  const phone_number = context.TWILIO_PHONE_NUMBER;
  // eslint-disable-next-line no-undef
  const response = new Twilio.Response();
  response.setStatusCode(200);
  response.appendHeader('Content-Type', 'application/json');
  response.setBody({ phone_number });
  callback(null, response);
};
