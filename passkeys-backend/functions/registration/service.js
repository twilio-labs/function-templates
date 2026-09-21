const assets = Runtime.getAssets();
const { origins } = require(assets['/origins.js'].path);
const { jsonResponse } = require(assets['/services/helpers.js'].path);

exports.handler = async function (context, _, callback) {
  const { DOMAIN_NAME } = context;

  const response = jsonResponse();

  const client = context.getTwilioClient();

  try {
    const service = await client.verify.v2.services.create({
      friendlyName: 'Passkeys Sample Backend',
      'passkeys.relyingParty.id': DOMAIN_NAME,
      'passkeys.relyingParty.name': 'Passkeys Sample Backend',
      'passkeys.relyingParty.origins': origins(context).join(','),
      'passkeys.authenticatorAttachment': 'platform',
      'passkeys.discoverableCredentials': 'preferred',
      'passkeys.userVerification': 'preferred',
    });

    response.setStatusCode(200);
    response.setBody({
      sid: service.sid,
      friendlyName: service.friendlyName,
      passkeys: service.passkeys,
    });
  } catch (error) {
    response.setStatusCode(error.status || 400);
    response.setBody(error.message);
  }

  return callback(null, response);
};
