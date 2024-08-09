/* eslint-disable no-nested-ternary, sonarjs/no-nested-template-literals */

const { sign, decode } = require('jsonwebtoken');

/**
 * @param {import('@twilio-labs/serverless-runtime-types/types').Context} context
 * @param {string} assistantSid
 * @param {*} body
 */
async function sendMessageToAssistant(context, assistantSid, body) {
  const environmentPrefix = context.TWILIO_REGION?.startsWith('stage')
    ? '.stage'
    : context.TWILIO_REGION?.startsWith('dev')
      ? '.dev'
      : '';
  const url = `https://assistants${environmentPrefix}.twilio.com/v1/${assistantSid}/Messages`;

  // Attention! There's explicitly no "await" since we want to do a "fire & forget"
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${context.ACCOUNT_SID}:${context.AUTH_TOKEN}`,
        'utf-8'
      ).toString('base64')}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  if (response.ok) {
    console.log('Sent message to AI Assistant');
  } else {
    throw new Error(
      `Failed to send request to AI Assistants. ${await response.text()}`
    );
  }
}

/**
 * @param {import('@twilio-labs/serverless-runtime-types/types').Context} context
 * @param {string} chatServiceSid
 * @param {string} conversationSid
 */
async function readConversationAttributes(
  context,
  chatServiceSid,
  conversationSid
) {
  try {
    const client = context.getTwilioClient();
    const data = await client.conversations.v1
      .services(chatServiceSid)
      .conversations(conversationSid)
      .fetch();
    return JSON.parse(data.attributes);
  } catch (err) {
    console.error(err);
    return {};
  }
}

/**
 * @param {import('@twilio-labs/serverless-runtime-types/types').Context} context
 * @param {*} event
 */
async function getAssistantSid(context, event) {
  if (event.EventType === 'onMessageAdded') {
    try {
      const { ConversationSid, ChatServiceSid } = event;
      const parsed = await readConversationAttributes(
        context,
        ChatServiceSid,
        ConversationSid
      );
      if (typeof parsed.assistantSid === 'string' && parsed.assistantSid) {
        return parsed.assistantSid;
      }
    } catch (err) {
      console.log('Invalid attribute structure', err);
    }
  }
  const assistantSid =
    event.AssistantId ||
    context.ASSISTANT_ID ||
    event.AssistantSid ||
    context.ASSISTANT_SID;

  if (!assistantSid) {
    throw new Error('Missing Assistant ID configuration');
  }

  return assistantSid;
}

/**
 * @param {import('@twilio-labs/serverless-runtime-types/types').Context} context
 * @param {*} event
 */
async function signRequest(context, event) {
  const assistantSid = await getAssistantSid(context, event);
  const authToken = context.AUTH_TOKEN;
  if (!authToken) {
    throw new Error('No auth token found');
  }
  return sign({ assistantSid }, authToken, { expiresIn: '5m' });
}

/**
 * @param {import('@twilio-labs/serverless-runtime-types/types').Context} context
 * @param {*} event
 */
function verifyRequest(context, event) {
  const token = event._token;
  if (!token) {
    throw new Error('Missing token');
  }

  const authToken = context.AUTH_TOKEN;
  if (!authToken) {
    throw new Error('No auth token found');
  }

  try {
    const decoded = decode(token, authToken, { json: true });
    if (decoded.assistantSid) {
      return true;
    }
  } catch (err) {
    console.error('Failed to verify token', err);
    return false;
  }
  return false;
}

module.exports = {
  getAssistantSid,
  signRequest,
  verifyRequest,
  sendMessageToAssistant,
  readConversationAttributes,
};
