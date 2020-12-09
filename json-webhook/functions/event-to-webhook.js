const fetch = require('node-fetch');

exports.handler = async function(context, event, callback) {
  try {
    // IFTTT only pulls the fields value1, value2, and value3 from webhook JSON;
    event.value1 = event.MessageSid;
    event.value2 = event.From;
    event.value3 = event.Body;

    const res = await fetch(context.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (res.ok) {
      callback(null, {});
    }
    else {
      console.log(res.statusText);
      callback(res.statusText)
    }
  } catch (error) {
    console.log({ error });
    callback(error);
  }
};
