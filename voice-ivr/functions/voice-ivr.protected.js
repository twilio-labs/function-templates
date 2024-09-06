/**
 * Voice IVR
 *
 * Description:
 * This file contains the entry point to the Voice IVR function template
 * which will prompt the user with an IVR phone tree with three options.
 *
 *
 * Contents:
 * 1. Main Handler
 */

/**
 * 1. Main Handler
 *
 * This is the entry point to your Twilio Function, which will create
 * and return a TwiML Voice Response that will prompt the user with
 * three options: Talk to Sales, Hours of Operation, or Address.
 * If the user enters something it will trigger the handle-user-input Function and otherwise go in a loop.
 *
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
