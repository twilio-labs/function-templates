exports.handler = function(context, event, callback) {
  let phone_number = context.TWILIO_PHONE_NUMBER;
  let response = new Twilio.Response();
  response.setStatusCode(200);
  response.appendHeader('Content-Type', 'application/json');
  response.setBody({'phone_number': phone_number});
  callback(null, response);
};
