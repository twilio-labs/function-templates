exports.handler = function (context, event, callback) {
  let blocklist = event.blocklist || context.BLOCKLIST || '';
  const blocklistArray = blocklist
    .toString()
    .split(',')
    .map((num) => num.trim());

  let twiml = new Twilio.twiml.VoiceResponse();
  let blocked = false;
  if (blocklistArray.length > 0 && blocklistArray.includes(event.From)) {
    blocked = true;
  }

  if (blocked) {
    twiml.reject();
  } else {
    // Update this line to your response.
    twiml.redirect(
      {
        method: 'GET',
      },
      'https://demo.twilio.com/docs/voice.xml'
    );
  }
  callback(null, twiml);
};
