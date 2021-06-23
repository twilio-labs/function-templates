function sendMessage(context, event) {
  const client = context.getTwilioClient();
  return client.messages
    .create({
      from: event.To,
      to: event.From,
      body: 'Here is our address: 375 Beale St #300, San Francisco, CA 94105, USA',
    })
    .then(
      (resp) => resp,
      (err) => {
        console.log(err);
        return Promise.resolve();
      }
    );
}

/**
 * Handles the user input gathered in the voice-ivr Function
 */
// eslint-disable-next-line consistent-return
exports.handler = function (context, event, callback) {
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

  let request = Promise.resolve();
  if (UserInput === '3') {
    request = sendMessage(context, event);
  }

  request
    .then(() => {
      return callback(null, twiml);
    })
    .catch((err) => {
      return callback(err);
    });
};
