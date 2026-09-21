const { v5 } = require('uuid');

const assets = Runtime.getAssets();
const { detectMissingParams, jsonResponse } = require(
  assets['/services/helpers.js'].path
);

exports.handler = async (context, event, callback) => {
  const { VERIFY_SERVICE_SID } = context;

  const response = jsonResponse();

  // Verify request comes with username
  const missingParams = detectMissingParams(['username'], event);
  if (missingParams) {
    response.setStatusCode(400);
    response.setBody(
      `Missing parameters; please provide: '${missingParams.join(', ')}'.`
    );

    return callback(null, response);
  }

  const client = context.getTwilioClient();

  /*
   * The API expects the identity to be a UUID, so derive a stable one from the
   * username instead of storing a mapping.
   */
  const uuidIdentity = v5(event.username, v5.URL);

  try {
    /* eslint-disable camelcase */
    const factor = await client.verify.v2
      .services(VERIFY_SERVICE_SID)
      .newFactors.create({
        friendly_name: event.username,
        identity: uuidIdentity,
        config: {
          authenticator_attachment: 'platform',
          discoverable_credentials: 'preferred',
          user_verification: 'preferred',
        },
      });
    /* eslint-enable camelcase */

    response.setStatusCode(200);
    response.setBody({
      ...factor.options.publicKey,
      identity: uuidIdentity,
    });
  } catch (error) {
    response.setStatusCode(error.status || 400);
    response.setBody(error.message);
  }

  return callback(null, response);
};
