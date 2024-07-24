/*
 * Forward an Incoming Call to a Specified Number
 * Description: When your Twilio Phone Number associated with this function
 * receives a call, it will forward the call to MY_PHONE_NUMBER
 * specified in /.env
 *
 * Contents:
 * 1. Main Handler
 */

/*
 * 1. Main Handler
 *
 * This is the entry point to your Twilio Function,
 * which will create a new Voice Response using Twiml
 * and use this to dial the MY_PHONE_NUMBER
 * specified in /.env
 * We then use the callback to return from your function
 * with the Twiml Voice Response you defined earlier.
 * In the callback in non-error situations, the first
 * parameter is null and the second parameter
 * is the value you want to return.
 */

exports.handler = function (context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  twiml.dial(context.MY_PHONE_NUMBER);
  callback(null, twiml);
};
