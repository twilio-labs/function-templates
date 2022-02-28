exports.handler = async function (context, event, callback) {
  const client = context.getTwilioClient();

  const lookup = await client.lookups.v1
    .phoneNumbers(event.From)
    .fetch({ type: ['carrier', 'caller-name'] });

  const callerName = lookup.callerName.caller_name;
  const carrierName = lookup.carrier.name;

  const body = `Incoming call from ${event.From}
Name: ${callerName === null ? 'Unknown' : callerName}
Carrier: ${carrierName} (${lookup.carrier.type})`;

  await client.messages.create({
    body,
    from: context.TWILIO_PHONE_NUMBER,
    to: context.MY_PHONE_NUMBER,
  });

  const twiml = new Twilio.twiml.VoiceResponse();
  twiml.dial(context.MY_PHONE_NUMBER);
  callback(null, twiml);
};
