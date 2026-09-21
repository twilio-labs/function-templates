/*
 * Served from a Function rather than a static asset: the file has no
 * extension, so the assets pipeline uploads it without a content type and
 * Apple rejects anything that is not application/json.
 */
exports.handler = function (context, event, callback) {
  const { IOS_APP_ID } = context;

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  response.setBody({
    webcredentials: { apps: IOS_APP_ID ? [IOS_APP_ID] : [] },
  });

  return callback(null, response);
};
