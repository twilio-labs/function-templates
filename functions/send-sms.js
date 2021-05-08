exports.handler = function(context, event, callback) {
  let client = context.getTwilioClient();

  client.messages
    .create({
      body: `Thanks for your interest in ${context.TITLE}, reply with ${context.OPT_IN_KEYWORD} to get started. Message and data rates may apply, ${context.MESSAGES_PER_MONTH} msgs / month.`,
      from: event.from,
      to: event.to
    })
    .then(message => callback(null, message.sid))
    .catch(err => console.log(err));
};