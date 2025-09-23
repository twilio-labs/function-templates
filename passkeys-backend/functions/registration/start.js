const axios = require('axios');
const { v5 } = require('uuid');

const assets = Runtime.getAssets();
const { detectMissingParams } = require(assets['/services/helpers.js'].path);

exports.handler = async (context, event, callback) => {
  const { API_URL, SERVICE_SID, NAMESPACE } = context;

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Verify request comes with username
  const missingParams = detectMissingParams(['username'], event);
  if (missingParams) {
    response.setStatusCode(400);
    response.setBody(
      `Missing parameters; please provide: '${missingParams.join(', ')}'.`
    );

    return callback(null, response);
  }

  const { username, password } = context.getTwilioClient();

  const uuidIdentity = v5(event.username, v5.URL);

  /* eslint-disable camelcase */
  const requestBody = {
    friendly_name: event.username,
    identity: uuidIdentity,
    config: {
      authenticator_attachment: 'platform',
      discoverable_credentials: 'preferred',
      user_verification: 'preferred',
    },
  };

  // Factor URL of the passkeys service
  const factorURL = `${API_URL}/${SERVICE_SID}/Passkeys/Factors`;

  // Call made to the passkeys service
  try {
    const APIResponse = await axios.post(factorURL, requestBody, {
      auth: {
        username,
        password,
      },
    });

    response.setStatusCode(200);
    response.setBody({
      ...APIResponse.data.options.publicKey,
      identity: uuidIdentity,
    });
  } catch (error) {
    const statusCode = error.status || 400;
    response.setStatusCode(statusCode);
    response.setBody(error.message);
  }

  return callback(null, response);
};
