exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();
  const twiml = new Twilio.twiml.MessagingResponse();

  if (event.From === context.MY_PHONE_NUMBER) {
    const separatorPosition = event.Body.indexOf(':');

    if (separatorPosition < 1) {
      twiml.message('You need to specify a recipient number and a ":" before the message. For example, "+12223334444: message".');
    } else {
      const recipientNumber = event.Body.substr(0, separatorPosition).trim();
      const messageBody = event.Body.substr(separatorPosition + 1).trim();

      try {
        await client.messages
                    .create({
                      to: recipientNumber,
                      from: event.To,
                      body: messageBody
                    });

        return callback(null);
      }
      catch (err) {
        twiml.message("There was an issue with the phone number you entered; please verify it is correct and try again.");
      }
    }
  } else {
    twiml.message({ to: context.MY_PHONE_NUMBER }, `${event.From}: ${event.Body}`);
  }

  callback(null, twiml);
};
