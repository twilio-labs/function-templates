const axios = require('axios');

const assets = Runtime.getAssets();
const { errorLogger } = require(assets['/services/helpers.js'].path);

// eslint-disable-next-line consistent-return
exports.handler = async (context, _, callback) => {
  const { RELYING_PARTY, API_URL, SERVICE_SID, ACCOUNT_SID, AUTH_TOKEN } =
    context;

  const requestBody = {
    details: {
      rpId: RELYING_PARTY,
    },
  };

  const challengeURL = `${API_URL}Services/${SERVICE_SID}/Challenges`;

  try {
    const response = await axios.post(challengeURL, requestBody, {
      auth: {
        username: ACCOUNT_SID,
        password: AUTH_TOKEN,
      },
    });
    return callback(null, response.data.details);
  } catch (error) {
    errorLogger(error);
    return callback('Something went wrong');
  }
};
