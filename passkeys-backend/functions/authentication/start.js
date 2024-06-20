const axios = require('axios');

const assets = Runtime.getAssets();

// eslint-disable-next-line consistent-return
exports.handler = async (context, _, callback) => {
  const { RELYING_PARTY, API_URL, ACCOUNT_SID, AUTH_TOKEN } = context;

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

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
        username: ACCOUNT_SID,
        password: AUTH_TOKEN,
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
