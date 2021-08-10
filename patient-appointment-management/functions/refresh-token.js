/* eslint-disable prefer-destructuring, dot-notation, consistent-return, spaced-comment */
exports.handler = function (context, event, callback) {
  const path = Runtime.getFunctions()['auth'].path;
  const { createAppToken, isValidAppToken } = require(path);

  const ac = context.ACCOUNT_SID;

  //assert(event.token, 'missing event.token');
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
  response.setBody({
    token: createAppToken('refresh', context),
  });
  callback(null, response);
};
