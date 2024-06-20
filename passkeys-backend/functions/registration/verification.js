const axios = require('axios');

const assets = Runtime.getAssets();
const { detectMissingParams } = require(assets['/services/helpers.js'].path);

// eslint-disable-next-line consistent-return
exports.handler = async (context, event, callback) => {
  const { API_URL, ACCOUNT_SID, AUTH_TOKEN } = context;

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  const missingParams = detectMissingParams(
    ['id', 'attestationObject', 'rawId', 'clientDataJson', 'transports'],
    event
  );
  if (missingParams) {
    response.setStatusCode(400);
    response.setBody(
      `Missing parameters; please provide: '${missingParams.join(', ')}'.`
    );

    return callback(null, response);
  }

  const requestBody = {
    content: {
      id: event.id,
      rawId: event.rawId,
      authenticatorAttachment: 'platform',
      type: 'public-key',
      response: {
        attestationObject: event.attestationObject,
        clientDataJSON: event.clientDataJson,
        transports: event.transports,
      },
    },
  };

  const verifyFactorURL = `${API_URL}/Factors/Approve`;

  try {
    const APIResponse = await axios.post(verifyFactorURL, requestBody, {
      auth: {
        username: ACCOUNT_SID,
        password: AUTH_TOKEN,
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
