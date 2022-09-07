const { customAlphabet } = require('nanoid');
const alphabet =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 32);

async function isServerInitialized(client, context) {
  const variables = await client.serverless
    .services(context.SERVICE_SID)
    .environments(context.ENVIRONMENT_SID)
    .variables.list();

  const passcodeVar = variables.find((v) => v.key === 'PASSCODE');

  return Boolean(passcodeVar);
}

async function initializeServer(client, context) {
  const passcode = nanoid();

  await client.serverless
    .services(context.SERVICE_SID)
    .environments(context.ENVIRONMENT_SID)
    .variables.create({ key: 'PASSCODE', value: passcode });

  return passcode;
}

exports.handler = async function (context, event, callback) {
  const client = context.getTwilioClient();
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  if (event.initialize === 'true') {
    if (await isServerInitialized(client, context)) {
      response.setStatusCode(500);
      response.setBody({ error: 'passcode already generated' });
      return callback(null, response);
    } else {
      const passcode = await initializeServer(client, context);
      response.setStatusCode(200);
      response.setBody({ passcode });
      return callback(null, response);
    }
  } else {
    response.setStatusCode(400);
    return callback(null, response);
  }
};
