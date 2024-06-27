const axios = require('axios');

// eslint-disable-next-line consistent-return
exports.handler = async (context, _, callback) => {
  const { RELYING_PARTY, API_URL } = context;

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  const { username, password } = context.getTwilioClient();

  const requestBody = {
    content: {
      // eslint-disable-next-line camelcase
      rp_id: RELYING_PARTY,
    },
  };

  const challengeURL = `${API_URL}/Verifications`;

  try {
    const APIResponse = await axios.post(challengeURL, requestBody, {
      auth: {
        username,
        password,
      },
    });

    response.setStatusCode(200);
    response.setBody(APIResponse.data.next_step);
  } catch (error) {
    const statusCode = error.status || 400;
    response.setStatusCode(statusCode);
    response.setBody(error.message);
  }

  return callback(null, response);
};
