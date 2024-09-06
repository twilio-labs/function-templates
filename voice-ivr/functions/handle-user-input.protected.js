/**
 * handle-user-input Function
 *
 * Description:
 * This file contains the input handler to the Voice IVR Function template.
 * The incoming phone call will be transferred from the voice-ivr Function
 * to this function using the Gather TwiML verb which will also pass in the
 * users input. This Function will read the users input and respond
 * back depending on the users selection.
 *
 *
 * Contents:
 * 1. SMS Handler
 * 2. Main Handler
 */

/**
 * 1. SMS Handler
 *
 * This function will send an SMS of the address to the caller
 * if the address option was chosen.
 *
 */

async function sendMessage(context, event) {
  const client = context.getTwilioClient();
  return client.messages.create({
    from: event.To,
    to: event.From,
    body: 'Here is our address: 375 Beale St #300, San Francisco, CA 94105, USA',
  });
}

/**
 * 1. Main Handler
 *
 * This Twilio Function will create a new Voice Response using Twiml
 * based on the users input from the voice-ivr Function.
 *
 * The function will fetch the user inputs by reading the Digits or
 * SpeechResult variables from the incoming request parameters. If the
 * user input was given by speech-to-text, it will convert it to its digit
 * counterpart.
 *
 * If option 1 (sales) was chosen, the function will forward the call
 * and dial the MY_PHONE_NUMBER specified in /.env. If option 2
 * (opening hours) was chosen, the Voice Response will respond to the
 * caller with the opening hours. If option 3 (address) was chosen,
 * the SMS handler will be executed and text the address to the caller.
 * If any other input was chosen, the call will go in a loop and redirect
 * the call to the voice-ivr Function.
 *
 */

exports.handler = async function (context, event, callback) {
  let UserInput = event.Digits || event.SpeechResult;
  const twiml = new Twilio.twiml.VoiceResponse();

  if (!UserInput) {
    twiml.say('Sorry something went wrong. Please call again');
    return callback(null, twiml);
  }

  if (UserInput.length > 1) {
    if (UserInput.toLowerCase().includes('sales')) {
      UserInput = '1';
    } else if (UserInput.toLowerCase().includes('opening hours')) {
      UserInput = '2';
    } else if (UserInput.toLowerCase().includes('address')) {
      UserInput = '3';
    }
  }

  switch (UserInput) {
    case '1':
      twiml.say(
        'Thank you. You will now be forwarded to our sales department.'
      );
      twiml.dial(context.MY_PHONE_NUMBER);
      break;
    case '2':
      twiml.say('We are open from 9am to 5pm every day but Sunday.');
      break;
    case '3':
      twiml.say(
        'We will send you a text message with our address in a minute.'
      );
      break;
    default:
      twiml.say(
        'We are sorry, we did not recognize your option. Please try again.'
      );
      twiml.redirect('voice-ivr');
  }

  try {
    if (UserInput === '3') await sendMessage(context, event);
  } catch (err) {
    console.log(err);
  }
  return callback(null, twiml);
};
