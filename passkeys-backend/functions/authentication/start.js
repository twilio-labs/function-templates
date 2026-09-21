const assets = Runtime.getAssets();
const { jsonResponse } = require(assets['/services/helpers.js'].path);

exports.handler = async (context, _, callback) => {
  const { VERIFY_SERVICE_SID } = context;

  const response = jsonResponse();

  const client = context.getTwilioClient();

  try {
    /*
     * No identity is sent: the challenge is resolved by the discoverable
     * credential the user picks on their device.
     */
    const challenge = await client.verify.v2
      .services(VERIFY_SERVICE_SID)
      .newChallenge()
      .create({});

    response.setStatusCode(200);
    response.setBody(challenge.options);
  } catch (error) {
    response.setStatusCode(error.status || 400);
    response.setBody(error.message);
  }

  return callback(null, response);
};
