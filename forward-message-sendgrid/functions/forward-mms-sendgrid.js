const got = require('got');
const request = require('request-promise-native');

exports.handler = function(context, event, callback) {
  imagePath = event.MediaUrl0;

  //read in the image here:
  request({
    url: imagePath,
    method: 'GET',
    encoding: null
  }) 
    .then(result => {

        let imageBuffer  = Buffer.from(result);
        let imageBase64  = imageBuffer.toString('base64');

        //now create the email message
        const msg = {
            personalizations: [{ to: [{ email: context.TO_EMAIL_ADDRESS }] }],
            from: { email: context.FROM_EMAIL_ADDRESS },
            subject: `New MMS message from: ${event.From}`,
            content: [
              {
                type: 'text/plain',
                value: event.Body
              }
            ],
            attachments: [
              {
                content: imageBase64,
                filename: "owl.png",
                type: "image/png",
                disposition: "attachment",
                content_id: "my_image"
              }
            ]
        };
        
        //send mail
        got.post('https://api.sendgrid.com/v3/mail/send', {
            headers: {
                Authorization: `Bearer ${context.SENDGRID_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(msg)
        })
        .then(response => {
            let twiml = new Twilio.twiml.MessagingResponse();
            callback(null, twiml);
        })
        .catch(err => {
            callback(err);
        });
    });
};
