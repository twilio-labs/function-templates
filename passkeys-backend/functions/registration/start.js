const axios = require('axios');

const assets = Runtime.getAssets();
const { detectMissingParams } = require(assets['/services/helpers.js'].path);

exports.handler = async (context, event, callback) => {
  const { DOMAIN_NAME, API_URL, ANDROID_APP_KEYS } = context;

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

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

  const androidOrigins = (keys) => {
    if (!keys || keys.trim() === '""') return [];
    return keys.split(',');
  };

  // Request body sent to passkeys verify URL call
  /* eslint-disable camelcase */
  const requestBody = {
    friendly_name: 'Passkey Example',
    to: {
      user_identifier: event.username,
    },
    content: {
      relying_party: {
        id: DOMAIN_NAME,
        name: 'PasskeySample',
        origins: [
          `https://${DOMAIN_NAME}`,
          ...androidOrigins(ANDROID_APP_KEYS),
        ],
      },
      user: {
        display_name: event.username,
      },
      authenticator_criteria: {
        authenticator_attachment: 'platform',
        discoverable_credentials: 'preferred',
        user_verification: 'preferred',
      },
    },
  };

  // Factor URL of the passkeys service
  const factorURL = `${API_URL}/Factors`;

  // Call made to the passkeys service
  try {
    const APIResponse = await axios.post(factorURL, requestBody, {
      auth: {
        username,
        password,
      },
    });

    response.setStatusCode(200);
    response.setBody(APIResponse.data.next_step);
  } catch (error) {
    console.error('Error in passkeys registration start:', error.message);
    const statusCode = error.status || 400;
    response.setStatusCode(statusCode);
    response.setBody(error.message);
  }

  return callback(null, response);
};
