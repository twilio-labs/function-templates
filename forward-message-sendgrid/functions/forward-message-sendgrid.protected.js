// Importing the sendgrid module
const sgMail = require('@sendgrid/mail');

exports.handler = function (context, event, callback) {
  // Setting the API key for Sendgrid
  sgMail.setApiKey(context.SENDGRID_API_KEY);

  // Creating the message content to send to Sendgrid
  const message = {
    to: context.TO_EMAIL_ADDRESS,
    from: context.FROM_EMAIL_ADDRESS,
    subject: `New SMS message from: ${event.From}`,
    text: event.Body,
  };

  // Sending the message using the sendgrid module
  sgMail
    .send(message)
    .then(() => {
      // Return a TwiML response back to Twilio
      const twiml = new Twilio.twiml.MessagingResponse();
      callback(null, twiml);
    })
    .catch((error) => {
      // Return an error response back to Twilio
      callback(error);
    });
};
