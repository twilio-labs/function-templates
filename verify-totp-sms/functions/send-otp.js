exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    if (typeof event.to === 'undefined' || event.to.trim() === '') {
      throw new Error("Missing 'to' parameter; please provide a phone number.");
    }

    const client = context.getTwilioClient();
    const service = context.VERIFY_SERVICE_SID;
    const { to } = event;
    const channel =
      typeof event.channel === 'undefined' ? 'sms' : event.channel;

    const verification = await client.verify
      .services(service)
      .verifications.create({
        to,
        channel,
      });

    console.log(`Sent verification: '${verification.sid}'`);
    response.setStatusCode(200);
    response.setBody({ ok: true });
    return callback(null, response);
  } catch (error) {
    response.setStatusCode(error.status || 400);
    response.setBody({
      ok: false,
      error: error.message,
    });
    return callback(null, response);
  }
};
