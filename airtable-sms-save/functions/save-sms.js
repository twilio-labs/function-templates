exports.handler = function(context, event, callback) {
  let twiml = new Twilio.twiml.MessagingResponse();
  var Airtable = require('airtable');
  var base = new Airtable({apiKey: context.AIRTABLE_APIKEY}).base(context.AIRTABLE_BASEID);

  base(context.AIRTABLE_TABLENAME).create({
    'Sid':event.Sid,
    'From': event.From,
    'Body': event.Body
  }).then(createdRecord => {
    twiml.message('The SMS was successfully saved.')
    callback(null, twiml);
  }).catch(err => {
    console.log(err);
    callback(err);
  });
};
