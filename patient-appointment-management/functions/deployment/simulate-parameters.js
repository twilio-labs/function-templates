/* eslint-disable prefer-destructuring, dot-notation, consistent-return, spaced-comment */
exports.handler = function (context, event, callback) {
    const path = Runtime.getFunctions()['auth'].path;
    const { isValidAppToken } = require(path);

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
    var ts = Math.round(new Date().getTime() / 1000);
    var tsTomorrow = ts + (24 * 3600);

    const simulationParameters = {
        customerName: context.CUSTOMER_NAME,
        customerPhoneNumber: context.TWILIO_PHONE_NUMBER,
        appointmentTimestamp: tsTomorrow,
        provider: "Dr.Diaz",
        location: "Pacific Primary Care"
    }
    response.setBody(simulationParameters);
    console.log("simulationParameters: ", simulationParameters);
    callback(null, response);
};
