const mailgun = require("mailgun-js");

exports.handler = function (context, event, callback) {
  // Configure these at https://www.twilio.com/console/functions/configure
  const { TO_EMAIL_ADDRESS, FROM_EMAIL_ADDRESS, MAILGUN_API_KEY, MG_VERIFIED_DOMAIN } = context;

  // Instantiate mailgun
  const mg = mailgun({ apiKey: MAILGUN_API_KEY, domain: MG_VERIFIED_DOMAIN });

  // Destructure the event
  const { From, Body } = event;

  // Build the message
  const data = {
    from: FROM_EMAIL_ADDRESS,
    to: TO_EMAIL_ADDRESS,
    subject: `New SMS from ${From}`,
    text: Body,
  };

  // Send the message
  mg.messages().send(data, function (error, body) {
    if (error) {
      callback(error);
    }
    const twiml = new Twilio.twiml.MessagingResponse();
    callback(null, twiml);
  });
};
