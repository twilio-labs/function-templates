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

/*
 * 2. Checking the Sender 
 *
 * Here you can checks if the message came from a specific number. 
 * This condition ensures that only the user with this phone number can send outgoing messages.
 */
  if (event.From === context.MY_PHONE_NUMBER) {
    // Looks for a : in the message body to separate the recipient's phone number from the message text.
    const separatorPosition = event.Body.indexOf(':');

        // If there is no :, a response is sent to the sender with a message explaining the required format: recipientPhoneNumber: message.
    if (separatorPosition < 1) {
      twiml.message(
        'You need to specify a recipient number and a ":" before the message. For example, "+12223334444: message".'
      );
      
    /*
    * 3. Extracting Recipient and Message
    * 
    * Here you can processes the incoming message body 
    * to extract the recipient's phone number and the actual message content
    */

    } else {
      // Extracts the recipient's phone number from the part of the message before the : and removes any extra whitespace.
      const recipientNumber = event.Body.substr(0, separatorPosition).trim();
      // Extracts the actual message from the part of the message after the ':'
      const messageBody = event.Body.substr(separatorPosition + 1).trim();

    /*
    * 4. Sending the Message
    * 
    * Here a try-catch block attempts to send an SMS message using the Twilio API
    */ 
      try {
        // Sends the SMS to recipientNumber with the message messageBody.
        await client.messages.create({
          to: recipientNumber,
          from: event.To,
          body: messageBody,
        });
        // If successful, callback(null) is called to signal that the function executed successfully without returning any TwiML.
        return callback(null);
      // If there is an error (e.g., an invalid phone number), a failure message is sent to the sender explaining that the phone number might be incorrect.  
      } catch (err) {
        twiml.message(
          'There was an issue with the phone number you entered; please verify it is correct and try again.'
        );
      }
    }
 /*
  * 5. Handling Messages from Other Senders
  * 
  * If the message is not from context.MY_PHONE_NUMBER, 
  * the function forwards it to the number stored in context.MY_PHONE_NUMBER, 
  */  
  } else {
    twiml.message(
      { to: context.MY_PHONE_NUMBER },
      `${event.From}: ${event.Body}`
    );
  }

  return callback(null, twiml);
};
