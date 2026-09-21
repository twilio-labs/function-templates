const assets = Runtime.getAssets();
const { isEmpty, jsonResponse, credentialFrom } = require(
  assets['/services/helpers.js'].path
);

exports.handler = async (context, event, callback) => {
  const { VERIFY_SERVICE_SID } = context;

  const response = jsonResponse();

  if (isEmpty(event)) {
    response.setStatusCode(400);
    response.setBody(
      `Something is wrong with the request. Please check the parameters.`
    );

    return callback(null, response);
  }

  const client = context.getTwilioClient();

  try {
    const verifiedFactor = await client.verify.v2
      .services(VERIFY_SERVICE_SID)
      .newVerifyFactors.update(
        credentialFrom(event, [
          'attestationObject',
          'clientDataJSON',
          'transports',
        ])
      );

    response.setStatusCode(200);
    response.setBody({
      status:
        verifiedFactor.status === 'approved'
          ? 'verified'
          : verifiedFactor.status,
    });
  } catch (error) {
    response.setStatusCode(error.status || 400);
    response.setBody(error.message);
  }

  return callback(null, response);
};
