const axios = require('axios');

const assets = Runtime.getAssets();
const { detectMissingParams, errorLogger } = require(assets[
  '/services/helpers.js'
].path);

exports.handler = async (context, event, callback) => {
  const { RELYING_PARTY, API_URL, SERVICE_SID, ACCOUNT_SID, AUTH_TOKEN } =
    context;

  // Verify request comes with username
  const missingParams = detectMissingParams(['username'], event);
  if (missingParams)
    return callback(
      `Missing parameters; please provide: '${missingParams.join(', ')}'.`
    );

  // Request body sent to passkeys verify URL call
  /* eslint-disable camelcase */
  const requestBody = {
    friendly_name: 'TouchID',
    factory_type: 'passkeys',
    entity: {
      identity: event.username,
      display_name: event.username,
    },
    config: {
      relying_party: {
        id: RELYING_PARTY,
        name: 'PasskeySample',
        origins: [
          `https://${RELYING_PARTY}`,
          'android:apk-key-hash:r-BvX79axOKgiSKVuBwFSylcgHo7aUuxCnumzx4XT6E',
          'android:apk-key-hash:UFzWPaUfGY8_scKVC2tGtgb-xBNXS5Z_PYajz3P-BVM',
        ],
      },
      authenticator_criteria: {
        authenticator_attachment: 'platform',
        discoverable_credentials: 'preferred',
        user_verification: 'preferred',
      },
    },
  };

  // Factor URL of the passkeys service
  const factorURL = `${API_URL}Services/${SERVICE_SID}/Factors`;

  // Call made to the passkeys service
  try {
    const response = await axios.post(factorURL, requestBody, {
      auth: {
        username: ACCOUNT_SID,
        password: AUTH_TOKEN,
      },
    });
    return callback(null, {
      ...response.data.config.creation_request,
      factor_sid: response.data.sid,
    });
  } catch (error) {
    errorLogger(error);
    return callback(null, error);
  }
};
