const axios = require('axios');

const assets = Runtime.getAssets();
const { detectMissingParams } = require(assets['/services/helpers.js'].path);

exports.handler = async (context, event, callback) => {
  const { API_URL, ACCOUNT_SID, AUTH_TOKEN } = context;

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  const missingParams = detectMissingParams(
    [
      'id',
      'rawId',
      'clientDataJson',
      'authenticatorData',
      'signature',
      'userHandle',
    ],
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
      rawId: event.rawId,
      id: event.id,
      authenticatorAttachment: 'platform',
      type: 'public-key',
      response: {
        clientDataJSON: event.clientDataJson,
        authenticatorData: event.authenticatorData,
        signature: event.signature,
        userHandle: event.userHandle,
      },
    },
  };

  const verifyChallengeURL = `${API_URL}/Verifications/Check`;

  try {
    const APIresponse = await axios.post(verifyChallengeURL, requestBody, {
      auth: {
        username: ACCOUNT_SID,
        password: AUTH_TOKEN,
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
