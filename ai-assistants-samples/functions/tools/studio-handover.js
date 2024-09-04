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

    console.log('attempting handover');
    const flowSid = event.FlowSid || event.flowSid || context.STUDIO_FLOW_SID;
    if (!flowSid) {
      console.error('Missing flow sid');
      return callback(new Error('Unable to hand over conversation'));
    }

    await client.conversations.v1
      .services(serviceSid)
      .conversations(conversationsSid)
      .webhooks.create({
        target: 'studio',
        configuration: {
          flowSid,
        },
      });

    console.log('handed over');
    const successMessage =
      event.SuccessMessage ??
      event.successMessage ??
      'Conversation handed over';
    return callback(null, successMessage);
  } catch (err) {
    console.error(err);
    return callback(null, 'Could not handover');
  }
};
