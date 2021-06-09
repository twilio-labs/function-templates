/**
 * Returns TwiML that prompts the users to make a choice.
 * If the user enters something it will trigger the handle-user-input Function and otherwise go in a loop.
 */
exports.handler = function (context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  const gather = twiml.gather({
    numDigits: 1,
    action: 'handle-user-input',
    hints: 'sales, opening hours, address',
    input: 'speech dtmf',
  });
  gather.say('Please press 1 or say Sales to talk to someone');
  gather.say('Press 2 or say Opening Hours to hear when we are open');
  gather.say(
    'Press 3 or say Address to receive a text message with our address'
  );
  twiml.say(`Sorry we couldn't understand you`);
  twiml.redirect();
  callback(null, twiml);
};
