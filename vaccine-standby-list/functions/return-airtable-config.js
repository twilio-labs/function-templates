exports.handler = function(context, event, callback) {
  let airtable_embed_code = context.AIRTABLE_EMBED_CODE;
  let phone_number = context.TWILIO_PHONE_NUMBER;
  let response = new Twilio.Response();
  response.setStatusCode(200);
  response.appendHeader('Content-Type', 'application/json');
  response.setBody({'airtable_embed_code': airtable_embed_code, 'phone_number': phone_number});
  callback(null, response);
};
