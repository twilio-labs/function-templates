exports.handler = function (context, event, callback) {
  // eslint-disable-next-line prefer-const
  let client = context.getTwilioClient();

  client.messages
    .create({
      body: `Thanks for your interest in ${context.CAMPAIGN_TITLE}, reply with ${context.OPT_IN_KEYWORD} to opt-in.`,
      from: context.TWILIO_PHONE_NUMBER,
      to: event.to,
    })
    .then((message) => {
      callback(null, message.sid);
    })
    .catch((err) => console.log(err));
};
