exports.handler = async function (context, event, callback) {
  const client = context.getTwilioClient();

  try {
    const originalCall = await client.calls(event.CallSid).fetch();
    const recordingUrl = event.RecordingUrl;

    const message = `You have a new message to your Twilio voicemail from ${originalCall.from}.\n${recordingUrl}`;

    await client.messages.create({
      from: originalCall.to,
      to: context.MY_PHONE_NUMBER,
      body: message,
    });

    return callback(null);
  } catch (err) {
    return callback(err);
  }
};
