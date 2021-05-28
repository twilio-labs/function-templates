// eslint-disable-next-line func-names
exports.handler = function (context, event, callback) {
  const path = Runtime.getFunctions()['auth'].path;
  const { createToken, isAllowed } = require(path);
  let ac = context.ACCOUNT_SID;

  const token = createToken(event.password, context);
  let response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  // Short-circuits
  if (isAllowed(token, context)) {
    response.setBody({ token });
    callback(null, response);
    return;
  }

  // eslint-disable-next-line no-undef
  response.setStatusCode(401);
  response.setBody({ message: 'Unauthorized' });

  callback(null, response);
};
