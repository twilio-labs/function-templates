exports.handler = function (context, event, callback) {
  const response = new Twilio.Response();

  var Airtable = require('airtable');
  var base = new Airtable({ apiKey: context.AIRTABLE_APIKEY }).base(
    context.AIRTABLE_BASEID
  );

  base
    .table(context.AIRTABLE_TABLENAME)
    .select()
    .all()
    .then((records) => {
      const sendingMessages = records.map((record) => {
        const client = context.getTwilioClient();
        return client.messages
          .create({
            to: record.get('PhoneNumber'),
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
};
