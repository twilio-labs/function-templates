const {
  signRequest,
  getAssistantSid,
  sendMessageToAssistant,
  readConversationAttributes,
} = require(Runtime.getAssets()['/utils.js'].path);

/**
 * @param {import('@twilio-labs/serverless-runtime-types/types').Context} context
 * @param {{}} event
 * @param {import('@twilio-labs/serverless-runtime-types/types').ServerlessCallback} callback
 */
exports.handler = async function (context, event, callback) {
  const assistantSid = await getAssistantSid(context, event);

  const { ConversationSid, ChatServiceSid, Author } = event;
  const AssistantIdentity =
    typeof event.AssistantIdentity === 'string'
      ? event.AssistantIdentity
      : undefined;

  const identity = Author.includes(':') ? Author : `user_id:${Author}`;

  const client = context.getTwilioClient();

  const webhooks = (
    await client.conversations.v1
      .services(ChatServiceSid)
      .conversations(ConversationSid)
      .webhooks.list()
  ).filter((entry) => entry.target === 'studio');

  if (webhooks.length > 0) {
    // ignoring if the conversation has a studio webhook set (assuming it was handed over)
    return callback(null, '');
  }

  const participants = await client.conversations.v1
    .services(ChatServiceSid)
    .conversations(ConversationSid)
    .participants.list();

  if (participants.length > 1) {
    // Ignoring the conversation because there is more than one human
    return callback(null, '');
  }

  const token = await signRequest(context, event);
  const params = new URLSearchParams();
  params.append('_token', token);
  if (typeof AssistantIdentity === 'string') {
    params.append('_assistantIdentity', AssistantIdentity);
  }
  const body = {
    Body: event.Body,
    Identity: identity,
    SessionId: `conversations__${ChatServiceSid}/${ConversationSid}`,
    // using a callback to handle AI Assistant responding
    Webhook: `https://${
      context.DOMAIN_NAME
    }/channels/conversations/response?${params.toString()}`,
  };

  const response = new Twilio.Response();
  response.appendHeader('content-type', 'text/plain');
  response.setBody('');

  const attributes = await readConversationAttributes(
    context,
    ChatServiceSid,
    ConversationSid
  );
  await client.conversations.v1
    .services(ChatServiceSid)
    .conversations(ConversationSid)
    .update({
      attributes: JSON.stringify({ ...attributes, assistantIsTyping: true }),
    });

  try {
    await sendMessageToAssistant(context, assistantSid, body);
  } catch (err) {
    console.error(err);
  }

  return callback(null, response);
};
