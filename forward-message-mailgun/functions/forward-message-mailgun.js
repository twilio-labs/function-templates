const mailgun = require("mailgun-js");

exports.handler = function (context, event, callback) {
  // Configure these at https://www.twilio.com/console/functions/configure
  const API_KEY = context.MAILGUN_API_KEY;
  const DOMAIN = context.MG_VERIFIED_DOMAIN;
  const TO = context.TO_EMAIL_ADDRESS;
  const FROM = context.FROM_EMAIL_ADDRESS;

  // Instantiate mailgun
  const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });

  // Destructure the event
  const { To, From, Body } = event;

  // Build the message
  const data = {
    from: `Excited User <${FROM}>`,
    to: `${TO}`,
    subject: `SMS received at Twilio number ${To}`,
    text: `SMS received from ${From}. \nMessage: ${Body}`,
  };

  // Send the message
  mg.messages().send(data, async function (error, body) {
    if (error) {
      console.log("Error", error);
      callback("Something went wrong", { error });
    }
    let twiml = await new Twilio.twiml.MessagingResponse();
    callback(null, twiml);
  });
};
