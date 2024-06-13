const axios = require('axios');

const assets = Runtime.getAssets();

// eslint-disable-next-line consistent-return
exports.handler = async (context, event, callback) => {
  const { RELYING_PARTY, API_URL, ACCOUNT_SID, AUTH_TOKEN } = context;

  const requestBody = {
    content: {
      // eslint-disable-next-line camelcase
      rp_id: RELYING_PARTY,
    },
  };

  const challengeURL = `${API_URL}/Verifications`;

  try {
    const response = await axios.post(challengeURL, requestBody, {
      auth: {
        username: ACCOUNT_SID,
        password: AUTH_TOKEN,
      },
    });
    return callback(null, response.data.next_step);
  } catch (error) {
    if (error.response) {
      console.log('Client has given an error', error);
    } else if (error.request) {
      console.log('Runtime error', error);
    } else {
      console.log(error);
    }
    return callback('Something went wrong');
  }
};
