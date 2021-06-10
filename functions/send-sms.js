exports.handler = function(context, event, callback) {
  let client = context.getTwilioClient();

  client.messages
    .create({
      body: `Thanks for your interest in ${context.TITLE}, reply with ${context.OPT_IN_KEYWORD} to get started. Text STOP to unsubscribe or HELP for info. Message and data rates may apply, ${context.MESSAGE_QUANTITY} msgs / month.`,
      from: context.TWILIO_PHONE_NUMBER,
      to: event.to
    })
    .then(message => callback(null, message.sid))
    .catch(err => console.log(err));
};