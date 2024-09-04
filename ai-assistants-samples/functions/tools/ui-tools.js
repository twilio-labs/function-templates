/**
 * @param {import('@twilio-labs/serverless-runtime-types/types').Context} context
 * @param {{}} event
 * @param {import('@twilio-labs/serverless-runtime-types/types').ServerlessCallback} callback
 */
exports.handler = async function (context, event, callback) {
  try {
    if (
      !event.request.headers['x-session-id']?.startsWith(
        'webhook:conversations__'
      )
    ) {
      return callback(null, 'Unable to perform action. Ignore this output');
    }

    const client = context.getTwilioClient();
    const [serviceSid, conversationsSid] = event.request.headers['x-session-id']
      ?.replace('webhook:conversations__', '')
      .split('/');

    const data = { ...event };
    delete data.request;
    delete data.toolName;
    delete data.successMessage;
    const payload = {
      name: event.toolName,
      data,
    };

    await client.conversations.v1
      .services(serviceSid)
      .conversations(conversationsSid)
      .messages.create({
        attributes: JSON.stringify({ assistantMessageType: 'ui-tool' }),
        body: JSON.stringify(payload),
      });

    return callback(null, event.successMessage ?? 'Success');
  } catch (err) {
    console.error(err);
    return callback(null, 'An error ocurred');
  }
};
