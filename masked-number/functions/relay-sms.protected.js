/*
 * Masking your phone number for SMS Forwarding and Responding
 *
 * Description:
 * This function acts as a message-forwarding service 
 * If the message comes from the user, it forwards the message to another number. 
 * If it comes from someone else, it forwards it to the user.
 *
 * Contents:
 * 1. Initialize Client and Response
 * 2. Sender Check
 * 3. Extracting Recipient and Message
 * 4. Sending the Message
 * 5. Handling Messages from Other Senders
 */

/*
 * 1. Initialize client and response 
 *
 * Here you can initialize a Twilio client (client) to interact with Twilio's API.
 *
 * A twiml object is created to generate TwiML (Twilio Markup Language) responses, 
 * which are instructions that tell Twilio how to respond to an incoming message.
 */

// Defines the main function handler for the Twilio Function.
exports.handler = async function (context, event, callback) {
  const client = context.getTwilioClient();
  const twiml = new Twilio.twiml.MessagingResponse();

  if (event.From === context.MY_PHONE_NUMBER) {
    const separatorPosition = event.Body.indexOf(':');

    if (separatorPosition < 1) {
      twiml.message(
        'You need to specify a recipient number and a ":" before the message. For example, "+12223334444: message".'
      );
    } else {
      const recipientNumber = event.Body.substr(0, separatorPosition).trim();
      const messageBody = event.Body.substr(separatorPosition + 1).trim();

      try {
        await client.messages.create({
          to: recipientNumber,
          from: event.To,
          body: messageBody,
        });

        return callback(null);
      } catch (err) {
        twiml.message(
          'There was an issue with the phone number you entered; please verify it is correct and try again.'
        );
      }
    }
  } else {
    twiml.message(
      { to: context.MY_PHONE_NUMBER },
      `${event.From}: ${event.Body}`
    );
  }

  return callback(null, twiml);
};
