const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

exports.handler = function (context, event, callback) {
  // Configure these at https://www.twilio.com/console/functions/configure
  const {
    TO_EMAIL_ADDRESS,
    FROM_EMAIL_ADDRESS,
    MAILGUN_API_KEY,
    MG_VERIFIED_DOMAIN,
  } = context;

  // Instantiate mailgun
  const mg = mailgun.client({ username: 'api', key: MAILGUN_API_KEY });

  // Destructure the event
  const { From, Body } = event;

  // Build the message
  const data = {
    from: FROM_EMAIL_ADDRESS,
    to: [TO_EMAIL_ADDRESS],
    subject: `New SMS from ${From}`,
    text: Body,
  };

  // Send the message
  mg.messages
    .create(MG_VERIFIED_DOMAIN, data)
    .then((msg) => {
      console.log(msg);
      const twiml = new Twilio.twiml.MessagingResponse();
      callback(null, twiml);
    })
    .catch((err) => {
      console.log(err);
      callback(err);
    });
};
