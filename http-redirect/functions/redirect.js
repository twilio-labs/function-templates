/**
 * HTTP Redirect Function
 *
 * This Function redirects a request from Twilio Functions to another URL by
 * setting the Location header to the respective URL
 */
exports.handler = function(context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Location', context.HTTP_REDIRECT_URL);
  callback(null, response);
};
