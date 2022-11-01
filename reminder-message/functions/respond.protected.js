exports.handler = async function (context, event, callback) {
  const twiml = new Twilio.twiml.MessagingResponse();

  if (typeof event.Body === 'string' && event.Body.toLowerCase() === 'y') {
    let delay = parseInt(context.DELAY_IN_MINUTES, 10);
    if (isNaN(delay)) {
      delay = 15;
    }

    const client = context.getTwilioClient();
    try {
      await client.messages.create({
        from: context.MESSAGING_SERVICE_SID,
        to: event.From, // sending to the phone number that sent us a message
        body: "Here's the reminder for your appointment. Have a great day!",
        scheduleType: 'fixed',
        sendAt: new Date(Date.now() + delay * 60 * 1000 + 10000), // add the delay to the current time and add a 10 second buffer to avoid hitting the minimum delay of 15 minutes
      });
      twiml.message(
        `Thank you! We will send you a reminder in ${delay} minutes`
      );
    } catch (err) {
      console.error(err);
      twiml.message(
        'Something went wrong with scheduling the message. Please check your Twilio logs.'
      );
    }
  } else {
    twiml.message(
      'Hello there! Please send "Y" to confirm your appointment and we will send you a reminder.'
    );
  }
  return callback(null, twiml);
};
