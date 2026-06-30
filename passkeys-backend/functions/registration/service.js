const axios = require('axios');

const assets = Runtime.getAssets();
const { origins } = require(assets['/origins.js'].path);

exports.handler = async function (context, event, callback) {
  const { DOMAIN_NAME, API_URL } = context;

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { username, password } = context.getTwilioClient();

  const data = new URLSearchParams();
  data.append('FriendlyName', 'Passkeys Sample Backend');
  data.append('Passkeys.RelyingParty.Id', DOMAIN_NAME);
  data.append('Passkeys.RelyingParty.Name', 'Passkeys Sample Backend');
  data.append('Passkeys.RelyingParty.Origins', origins(context).join(','));
  data.append('Passkeys.AuthenticatorAttachment', 'platform');
  data.append('Passkeys.DiscoverableCredentials', 'preferred');
  data.append('Passkeys.UserVerification', 'preferred');

  const createServiceURL = `${API_URL}`;

  try {
    const APIResponse = await axios.post(createServiceURL, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username,
        password,
      },
    });

    response.setStatusCode(200);
    response.setBody(APIResponse.data);
  } catch (error) {
    const statusCode = error.status || 400;
    response.setStatusCode(statusCode);
    response.setBody(error.message);
  }

  return callback(null, response);
};
