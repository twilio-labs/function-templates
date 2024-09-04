const {
  signRequest,
  getAssistantSid,
  sendMessageToAssistant,
  readConversationAttributes,
} = require(Runtime.getAssets()['/utils.js'].path);

/**
 * @param {import('@twilio-labs/serverless-runtime-types/types').Context} context
 * @param {{
 *   Data?: string;
 *   Body?: string;
 * }} event
 * @param {import('@twilio-labs/serverless-runtime-types/types').ServerlessCallback} callback
 */
exports.handler = async function (context, event, callback) {
  const assistantSid = await getAssistantSid(context, event);

  const data = typeof event.Data === 'string' ? JSON.parse(event.Data) : {};
  const {
    ChannelSid: ConversationSid,
    InstanceSid: ChatServiceSid,
    From: Author,
  } = data;

  const Body = typeof event.Body === 'string' ? event.Body : data.Body;
  const AssistantIdentity =
    typeof event.AssistantIdentity === 'string'
      ? event.AssistantIdentity
      : undefined;

  if (
    typeof ConversationSid !== 'string' ||
    typeof ChatServiceSid !== 'string' ||
    typeof Author !== 'string'
  ) {
    return callback(
      new Error(
        'Failed request. Make sure to configure your Studio widget to pass "Data" with the value "{{trigger.conversation | to_json}}. This only works for "Incoming Conversation" flows.'
      )
    );
  }

  let identity = Author.includes(':') ? Author : `user_id:${Author}`;
  if (Author.startsWith('FX')) {
    // User is a Flex Web Chat Conversation Participant
    identity = `flex_participant:${Author}`;
  }

  const client = context.getTwilioClient();

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
    Body,
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
