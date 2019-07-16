const got = require('got');

exports.handler = function(context, event, callback) {
  const requestBody = {
    content: {
      from: context.FROM_EMAIL_ADDRESS,
      subject: `New SMS message from: ${event.From}`,
      text: event.Body
    },
    recipients: [{ address: { email: context.TO_EMAIL_ADDRESS } }],
    options: {
      sandbox: true
    }
  };

  got
    .post('https://api.sparkpost.com/api/v1/transmissions', {
      headers: {
        Authorization: `${context.SPARKPOST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    .then(response => {
      const twiml = new Twilio.twiml.MessagingResponse();
      callback(null, twiml);
    })
    .catch(err => {
      callback(err);
    });
};
