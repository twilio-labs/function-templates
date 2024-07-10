const axios = require('axios');

const assets = Runtime.getAssets();
const { isEmpty } = require(assets['/services/helpers.js'].path);

exports.handler = async (context, event, callback) => {
  const { API_URL } = context;

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  if (isEmpty(event)) {
    response.setStatusCode(400);
    response.setBody(
      `Something is wrong with the request. Please check the parameters.`
    );
    return callback(null, response);
  }

  const { username, password } = context.getTwilioClient();

  const requestBody = {
    content: {
      rawId: event.rawId,
      id: event.id,
      authenticatorAttachment: event.authenticatorAttachment,
      type: event.type,
      response: event.response,
    },
  };

  const verifyChallengeURL = `${API_URL}/Verifications/Check`;

  try {
    const APIresponse = await axios.post(verifyChallengeURL, requestBody, {
      auth: {
        username,
        password,
      },
    });

    response.setStatusCode(200);
    response.setBody({
      status: APIresponse.data.status,
      identity: APIresponse.data.to.user_identifier,
    });
  } catch (error) {
    const statusCode = error.status || 400;
    response.setStatusCode(statusCode);
    response.setBody(error.message);
  }

  return callback(null, response);
};
