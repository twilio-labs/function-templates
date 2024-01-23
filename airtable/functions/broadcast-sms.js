import Airtable from 'airtable';

//eslint-disable-import/no-unused-modules
export default function handler(context, event, callback) {
  const response = new Twilio.Response();
  const base = new Airtable({ apiKey: context.AIRTABLE_API_KEY }).base(
    context.AIRTABLE_BASE_ID
  );

  base
    .table(context.AIRTABLE_TABLE_NAME)
    .select()
    .all()
    .then((records) => {
      const sendingMessages = records.map((record) => {
        const client = context.getTwilioClient();
        return client.messages
          .create({
            to: record.get('From'),
            from: context.TWILIO_PHONE_NUMBER,
            body: 'This is a broadcast message from Twilio.',
          })
          .then((msg) => {
            console.log(msg.sid);
          })
          .catch((err) => {
            console.log(err);
          });
      });
      return Promise.all(sendingMessages);
    })
    .then(() => {
      callback(null, response);
    })
    .catch((err) => {
      callback(err);
    });
}
