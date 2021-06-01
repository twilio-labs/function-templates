exports.handler = async function (context, event, callback) {
  const client = context.getTwilioClient();

  try {
    if (event.type === 'track' && event.event === context.SEGMENT_EVENT) {
      let body = `The Segment event "${event.event}" occurred.`;

      if (event.properties && Object.keys(event.properties).length > 0) {
        body += '\n\n';

        for (const [key, value] of Object.entries(event.properties)) {
          body += `${key}: ${JSON.stringify(value)}\n`;
        }
      }

      await client.messages.create({
        to: context.MY_PHONE_NUMBER,
        from: context.TWILIO_PHONE_NUMBER,
        body,
      });
    }
  } catch (err) {
    callback(err);
  }

  callback(null, {});
};
