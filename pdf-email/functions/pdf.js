/**
 *
 *  This Function shows you how to create and send pdf on the fly using Twilio Sendgrid.
 *  The main idea is that files created on the fly within a Twilio Function are always stored under the /tmp/ directory
 *  So after the pdf making, we grant the relevant permissions to the file so that we can access the contents and send it via email as normal
 *  IMPORTANT: Use this function if you want to perform an action that does not require permanent storage as the contents of /tmp/ are removed - preferably single function invocation logic
 *
 *  Pre-requisites
 *  - You need to have a Twilio Sendgrid API KEY
 *  - You need to include the following npm modules: pdfmake, fs, pdf-to-base64, request, node-cmd
 */

var pdfPrinter = require('pdfmake');
var fs = require('fs');
var cmd = require('node-cmd');
const got = require('got');
const pdf2base64 = require('pdf-to-base64');

exports.handler = function(context, event, callback) {
  
  /*Details to be passed. Here they are passed statically, in real scenario you pass it as parameters in the Twilio Function*/
  let description = event.Body || 'Content of the pdf';

  /* change this to a dynamic value if needed*/
  const recipientEmailAddress = context.TO_EMAIL_ADDRESS;

  /*Prepare the body of the pdf. For more info on options, look at pdfmake doc
      http://pdfmake.org/#/
      */
  var docDefinition = {
    content: [
      { text: '\n' + description, fontSize: 14 }
    ]
  };

  var pdfDoc = new pdfPrinter({
    Roboto: {
      normal: new Buffer(
        require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Regular.ttf'],
        'base64'
      )
    }
  }).createPdfKitDocument(docDefinition);
  let temp = '/tmp/';
  let fileName = 'receipt.pdf';
  let path = temp + fileName;
  pdfDoc.pipe(fs.createWriteStream(path));
  pdfDoc.end();

  /*Find the file in the /tmp/ folder and provide the appropriate permissions*/
  cmd.get('chmod +r /tmp/' + fileName, function(error, data, stderr) {
    /*Show the contents. This is just for you to see the file, not really affecting the end result, you can remove it*/
    cmd.get('ls -l /tmp/', function(error, data, stderr) {
      /*Prepare the file. Twilio Sendgrid requires the file to be on base64 format*/
      pdf2base64(path)
        .then(response => {
          const data = {
            personalizations: [
              {
                to: [
                  {
                    email: recipientEmailAddress,
                    name: 'TO Name'
                  }
                ],
                subject: 'Hello! Here is your pdf'
              }
            ],
            from: {
              email: context.FROM_EMAIL_ADDRESS
            },
            content: [
              {
                type: 'text/plain',
                value: 'Here is the content of your email'
              }
            ],
            attachments: [
              {
                filename: fileName,
                content: response
              }
            ] //,
            //OPTIONAL IF YOU HAVE YOUR OWN template_id
            //"template_id": context.EMAIL_TEMPLATE_ID
          };

          /*Send the request*/
          got
            .post('https://api.sendgrid.com/v3/mail/send', {
              headers: {
                Authorization: `Bearer ${context.SENDGRID_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            })
            .then(response => {
              callback(null, "OK"); 
            })
            .catch(error => {
              callback(error);
            });
        })
        .catch(error => {
          callback(error);
        });
    })
    .catch(error => {
      callback(error);
    });
  })
  .catch(error => {
    callback(error);
  });
};
