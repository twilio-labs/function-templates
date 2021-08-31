/* eslint-disable prefer-destructuring, dot-notation */
exports.handler = function (context, event, callback) {
  const path = Runtime.getFunctions()['auth'].path;
  const { isValidAppToken } = require(path);
  const ts = Math.round(new Date().getTime());
  const tsTomorrow = ts + 24 * 3600 * 1000;

  if (!isValidAppToken(event.token, context)) {
    const response = new Twilio.Response();
    response.setStatusCode(401);
    response.appendHeader(
      'Error-Message',
      'Invalid or expired token. Please refresh the page and login again.'
    );
    response.appendHeader('Content-Type', 'application/json');
    response.setBody({ message: 'Unauthorized' });

    return callback(null, response);
  }

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  const simulationParameters = {
    customerName: context.CUSTOMER_NAME,
    customerPhoneNumber: context.TWILIO_PHONE_NUMBER,
    appointmentTimestamp: tsTomorrow,
    provider: 'Dr. Diaz',
    location: 'Pacific Primary Care',
  };
  response.setBody(simulationParameters);
  return callback(null, response);
};
