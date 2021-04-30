const crypto = require("crypto");

exports.handler = function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader("Content-Type", "application/json");
  response.setStatusCode(200);
  response.setBody({
    identity: crypto.createHash("sha256").update(event.identity).digest("hex"),
  });
  return callback(null, response);
};
