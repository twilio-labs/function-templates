exports.handler = function(context, event, callback) {
  let client = context.getTwilioClient();

  client.messages
    .create({
      body: `Thanks for your interest in our campaign, reply with ${context.OPT_IN_KEYWORD} to get started`,
      from: event.from,
      to: event.to
    })
    .then(message => callback(null, message.sid))
    .catch(err => console.log(err));
};