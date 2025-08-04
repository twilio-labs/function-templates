/*
 * Email Open and Click Alerts via SMS
 * Description: This template tracks and sends SMS alerts of email open and click statuses.
 *
 * Contents:
 * 1. Main Handler
 */

/*
 * 1. Main Handler
 *
 * This is the entry point to your Twilio Function,
 * which will capture all 'open' and 'click' webhook events from
 * SendGrid and send each as an SMS alert to MY_PHONE_NUMBER
 * specified in /.env
 *
 * It'll first clean the incoming response and remove unnecessary
 * sendgrid events. It will then iterate through the events, parse
 * them and construct the message that will be sent to MY_PHONE_NUMBER
 *
 *
 */
exports.handler = function (context, event, callback) {
  // Filter and process incoming events for 'open' or 'click'
  const receivedEvents = Object.values(event).filter(
    (receivedEvent) =>
      receivedEvent.event === 'open' || receivedEvent.event === 'click'
  );

  const client = context.getTwilioClient();

  // Map events to SMS message requests
  const messageRequests = receivedEvents.map((receivedEvent) => {
    const recipient = receivedEvent.email;
    const category = receivedEvent.category
      ? ` '${receivedEvent.category[0]}'`
      : '';
    const eventType = receivedEvent.event;

    // Construct the SMS message
    const message =
      eventType === 'open'
        ? `Your${category} email has been opened by ${recipient}.`
        : `The link in your${category} email has been clicked by ${recipient}.`;

    return client.messages
      .create({
        from: context.TWILIO_PHONE_NUMBER,
        to: context.MY_PHONE_NUMBER,
        body: message,
      })
      .then((msg) => {
        return { success: true, sid: msg.sid };
      })
      .catch((err) => {
        return { success: false, error: err.message };
      });
  });

  Promise.all(messageRequests)
    .then((result) => {
      return callback(null, { result });
    })
    .catch((err) => {
      console.error(err);
      return callback('Failed to fetch messages');
    });
};
