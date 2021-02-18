
// eslint-disable-next-line func-names
exports.handler = function (context, event, callback) {
  const path = Runtime.getFunctions()['auth'].path;
  const { createToken, isAllowed } = require(path);
  let ac = context.ACCOUNT_SID;

  const token = createToken(event.password, context);  

  // Short-circuits
  if (isAllowed(token, context)) {
    callback(null, { token });
  }

  // eslint-disable-next-line no-undef
  const response = new Twilio.Response();
  response.setStatusCode(403);
  response.setBody({ message: 'Unauthorized' });

  callback(null, response);
};
