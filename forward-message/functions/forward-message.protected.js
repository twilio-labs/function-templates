/*
 * Forward a Message to a Specified Number or List of Numbers
 *
 * Description: When your Twilio Phone Number associated with this function
 * receives an SMS, it will forward the message to the phone number(s) listed
 * in FORWARDING_NUMBERS specified in /.env. This will work whether a single
 * number or multiple numbers are listed.
 *
 * Contents:
 * 1. Main Handler
 */

/*
 * 1. Main Handler
 *
 * This is the entry point to your Twilio Function,
 * which will create a new MessagingResponse using TwiML
 * and forward the incoming SMS to each number specified in
 * the FORWARDING_NUMBERS environment variable.
 *
 * We then use the callback to return from your function
 * with the TwiML MessagingResponse you defined earlier.
 * In the callback, in non-error situations, the first
 * parameter is null and the second parameter
 * is the value you want to return.
 */

exports.handler = function (context, event, callback) {
  const twiml = new Twilio.twiml.MessagingResponse();

  context.FORWARDING_NUMBERS.split(/,\s?/).forEach((number) => {
    twiml.message({ to: number }, `From: ${event.From}. Body: ${event.Body}`);
  });

  callback(null, twiml);
};
