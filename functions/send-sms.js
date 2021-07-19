exports.handler = function(context, event, callback) {
  let client = context.getTwilioClient();
  console.log(event);
  client.messages
    .create({
      body: `Thanks for your interest in ${context.CAMPAIGN_TITLE}, reply with ${context.OPT_IN_KEYWORD} to opt-in.`,
      from: context.TWILIO_PHONE_NUMBER,
      to: event.to
    })
    .then(message => {
      callback(null, message.sid)
    })
    .catch(err => console.log(err));
};