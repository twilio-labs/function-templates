import Airtable from 'airtable';

//eslint-disable-import/no-unused-modules
export default function handler(context, event, callback) {
  const twiml = new Twilio.twiml.MessagingResponse();

  const base = new Airtable({ apiKey: context.AIRTABLE_API_KEY }).base(
    context.AIRTABLE_BASE_ID
  );

  base
    .table(context.AIRTABLE_TABLE_NAME)
    .create({
      Sid: event.MessageSid,
      From: event.From,
      Body: event.Body,
    })
    .then((createdRecord) => {
      twiml.message('The SMS was successfully saved.');
      callback(null, twiml);
    })
    .catch((err) => {
      console.log(err);
      callback(err);
    });
}
