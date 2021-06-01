exports.handler = function (context, event, callback) {
  const client = context.getTwilioClient();

  client.conversations
    .conversations(event.ConversationSid)
    .webhooks.create({
      'configuration.flowSid': context.STUDIO_FLOW_SID,
      'configuration.replayAfter': 0,
      target: 'studio',
    })
    .then((webhook) => {
      const response = `webhook ${webhook.sid} successfully created`;
      callback(null, response);
    })
    .catch((err) => {
      console.log(err);
      callback(err);
    });
};
