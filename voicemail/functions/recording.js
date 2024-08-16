/*
 * recording.js
 * Description:
 * This Twilio Function is executed when a voicemail
 * recording has been processed by Twilio. This
 * recording is initiated in the voicemail function
 * located in voicemail.protected.js. Once the recording
 * is finished and processed, it will send the
 * generated recording URL to MY_PHONE_NUMBER
 * specified in /.env.
 *
 * Contents:
 * 1. Main Handler
 */

/*
 * 1. Main Handler
 *
 * This is the entry point to your Twilio Function,
 * which will send the provided recording URL as an SMS
 * to MY_PHONE_NUMBER specified in /.env.
 *
 * The function will fetch the Twilio Client provided by
 * Functions. The Twilio client will be used to find the Twilio Number
 * the voicemail was left at. It will then use the Twilio Client
 * send an SMS of the recording URL from that number to
 * MY_PHONE_NUMBER specified in /.env.
 */

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
