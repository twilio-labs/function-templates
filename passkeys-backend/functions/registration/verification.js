const axios = require('axios');

const assets = Runtime.getAssets();
const { isEmpty } = require(assets['/services/helpers.js'].path);

// eslint-disable-next-line consistent-return
exports.handler = async (context, event, callback) => {
  const { API_URL, SERVICE_SID } = context;

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (isEmpty(event)) {
    response.setStatusCode(400);
    response.setBody(
      `Something is wrong with the request. Please check the parameters.`
    );

    return callback(null, response);
  }

  const { username, password } = context.getTwilioClient();

  const responseData = event.response
    ? event.response
    : {
        attestationObject: event.attestationObject,
        clientDataJSON: event.clientDataJSON,
        transports: event.transports,
      };

  const requestBody = {
    id: event.id,
    rawId: event.rawId,
    authenticatorAttachment: event.authenticatorAttachment || 'platform',
    type: event.type || 'public-key',
    response: responseData,
  };

  const verifyFactorURL = `${API_URL}/${SERVICE_SID}/Passkeys/VerifyFactor`;

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
