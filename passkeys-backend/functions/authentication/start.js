const axios = require('axios');

// eslint-disable-next-line consistent-return
exports.handler = async (context, _, callback) => {
  const { API_URL, SERVICE_SID } = context;

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { username, password } = context.getTwilioClient();

  const challengeURL = `${API_URL}/${SERVICE_SID}/Passkeys/Challenges`;

  try {
    const APIResponse = await axios.post(
      challengeURL,
      {},
      {
        auth: {
          username,
          password,
        },
      }
    );

    response.setStatusCode(200);
    response.setBody(APIResponse.data.options);
  } catch (error) {
    const statusCode = error.status || 400;
    response.setStatusCode(statusCode);
    response.setBody(error.message);
  }

  return callback(null, response);
};
