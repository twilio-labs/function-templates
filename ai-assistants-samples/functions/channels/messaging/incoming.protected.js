const { signRequest, getAssistantSid, sendMessageToAssistant } = require(
  Runtime.getAssets()['/utils.js'].path
);
const crypto = require('crypto');

/**
 * @param {import('@twilio-labs/serverless-runtime-types/types').Context} context
 * @param {{}} event
 * @param {import('@twilio-labs/serverless-runtime-types/types').ServerlessCallback} callback
 */
exports.handler = async function (context, event, callback) {
  const twiml = new Twilio.twiml.MessagingResponse();

  const assistantSid = await getAssistantSid(context, event);

  // using cookies for sessions so that a session persists for 4h (lifetime of cookie)
  const sessionId =
    event.request.cookies.SESSION_ID ||
    `messaging__${event.To}/${crypto.randomUUID()}`;

  const token = await signRequest(context, event);
  const body = {
    Body: event.Body,
    Identity: event.From.startsWith('whatsapp:')
      ? event.From
      : `phone:${event.From}`,
    SessionId: sessionId,
    Webhook: `https://${context.DOMAIN_NAME}/channels/messaging/response?_token=${token}`,
  };

  const response = new Twilio.Response();
  response.setCookie('SESSION_ID', sessionId);
  response.appendHeader('content-type', 'text/xml');
  response.setBody(twiml.toString());

  try {
    await sendMessageToAssistant(context, assistantSid, body);
  } catch (err) {
    console.error(err);
  }

  return callback(null, response);
};
