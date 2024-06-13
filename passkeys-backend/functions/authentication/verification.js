const axios = require('axios');

const assets = Runtime.getAssets();
const { detectMissingParams } = require(assets['/services/helpers.js'].path);

// eslint-disable-next-line consistent-return
exports.handler = async (context, event, callback) => {
  const { API_URL, ACCOUNT_SID, AUTH_TOKEN } = context;
  const missingParams = detectMissingParams(
    [
      'id',
      'rawId',
      // 'type',
      'clientDataJson',
      'authenticatorData',
      'signature',
      'userHandle',
    ],
    event
  );
  if (missingParams)
    return callback(
      `Missing parameters; please provide: '${missingParams.join(', ')}'.`
    );

  const requestBody = {
    content: {
      rawId: event.rawId,
      id: event.id,
      authenticatorAttachment: 'platform',
      // type: event.type,
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
    const response = await axios.post(verifyChallengeURL, requestBody, {
      auth: {
        username: ACCOUNT_SID,
        password: AUTH_TOKEN,
      },
    });
    return callback(null, {
      status: response.data.status,
      identity: response.data.to.user_identifier,
    });
  } catch (error) {
    if (error.response) {
      console.log('Client has given an error', error);
    } else if (error.request) {
      console.log('Runtime error', error);
    } else {
      console.log(error);
    }
    return callback(null, error);
  }
};
