const fetch = require('node-fetch');

exports.handler = async function(context, event, callback) {
  try {
    const res = await fetch(context.ZAPIER_WEBHOOK_URL, {
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
