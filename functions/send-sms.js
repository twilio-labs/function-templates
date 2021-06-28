exports.handler = function(context, event, callback) {
  let client = context.getTwilioClient();
  console.log(event);
  client.messages
    .create({
      body: `Thanks for your interest in ${context.CAMPAIGN_TITLE}, reply with ${context.OPT_IN_KEYWORD} to get started. Text STOP to unsubscribe or HELP for info. Message and data rates may apply, ${context.MESSAGE_FREQUENCY}.`,
      from: context.TWILIO_PHONE_NUMBER,
      to: event.to
    })
    .then(message => {
      
      callback(null, message.sid)
    })
    .catch(err => console.log(err));
};