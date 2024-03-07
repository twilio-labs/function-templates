const axios = require('axios');

const assets = Runtime.getAssets();
const { detectMissingParams, errorLogger } = require(assets[
  '/services/helpers.js'
].path);

// eslint-disable-next-line consistent-return
exports.handler = async (context, event, callback) => {
  const { API_URL, SERVICE_SID, ACCOUNT_SID, AUTH_TOKEN } = context;

  const missingParams = detectMissingParams(
    ['id', 'attestationObject', 'rawId', 'clientDataJson', 'transports'],
    event
  );
  if (missingParams)
    return callback(
      `Missing parameters; please provide: '${missingParams.join(', ')}'.`
    );

  const requestBody = {
    id: event.id,
    rawId: event.rawId,
    authenticatorAttachment: 'platform',
    type: 'public-key',
    response: {
      attestationObject: event.attestationObject,
      clientDataJSON: event.clientDataJson,
      transports: event.transports,
    },
  };

  const verifyFactorURL = `${API_URL}Services/${SERVICE_SID}/Factors/Verify`;

  try {
    const response = await axios.post(verifyFactorURL, requestBody, {
      auth: {
        username: ACCOUNT_SID,
        password: AUTH_TOKEN,
      },
    });
    return callback(null, {
      status: response.data.status,
    });
  } catch (error) {
    errorLogger(error);
    return callback(null, error);
  }
};
