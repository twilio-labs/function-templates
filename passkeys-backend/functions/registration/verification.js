const axios = require('axios');

const assets = Runtime.getAssets();
const { isEmpty } = require(assets['/services/helpers.js'].path);

// eslint-disable-next-line consistent-return
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
      id: event.id,
      rawId: event.rawId,
      authenticatorAttachment: event.authenticatorAttachment,
      type: event.type,
      response: event.response,
    },
  };

  const verifyFactorURL = `${API_URL}/Factors/Approve`;

  try {
    const APIResponse = await axios.post(verifyFactorURL, requestBody, {
      auth: {
        username,
        password,
      },
    });
    response.setStatusCode(200);
    response.setBody({
      status:
        APIResponse.data.status === 'approved'
          ? 'verified'
          : APIResponse.data.status,
    });
  } catch (error) {
    const statusCode = error.status || 400;
    response.setStatusCode(statusCode);
    response.setBody(error.message);
  }

  return callback(null, response);
};
