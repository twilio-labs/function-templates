const { verifyRequest, readConversationAttributes } = require(
  Runtime.getAssets()['/utils.js'].path
);

/**
 * @param {import('@twilio-labs/serverless-runtime-types/types').Context} context
 * @param {{}} event
 * @param {import('@twilio-labs/serverless-runtime-types/types').ServerlessCallback} callback
 */
exports.handler = async function (context, event, callback) {
  try {
    if (!verifyRequest(context, event)) {
      return callback(new Error('Invalid token'));
    }
    console.log('response', event);
    const assistantIdentity =
      typeof event._assistantIdentity === 'string'
        ? event._assistantIdentity
        : undefined;

    if (event.Status === 'Failed') {
      console.error(event);
      return callback(
        new Error('Failed to generate response. Check error logs.')
      );
    }

    const client = context.getTwilioClient();

    const [serviceSid, conversationsSid] = event.SessionId.replace(
      'webhook:conversations__',
      ''
    ).split('/');
    const body = event.Body;

    const attributes = await readConversationAttributes(
      context,
      serviceSid,
      conversationsSid
    );
    await client.conversations.v1
      .services(serviceSid)
      .conversations(conversationsSid)
      .update({
        attributes: JSON.stringify({ ...attributes, assistantIsTyping: false }),
      });

    const message = await client.conversations.v1
      .services(serviceSid)
      .conversations(conversationsSid)
      .messages.create({
        body,
        author: assistantIdentity,
      });

    console.log(`conversation message sent ${message.sid}`);

    return callback(null, {});
  } catch (err) {
    console.error(err);
    return callback(null, {});
  }
};
