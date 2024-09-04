/*
 * Block Spam Calls
 *
 * Description:
 * This application uses Twilio Add-ons from the Twilio Marketplace to block
 * unwanted voice calls. The 2 Add-ons used in this application are Marchex
 * Clean Call and Nomorobo Spam Score. The application provides the spam rating
 * of every inbound call to a Twilio number via the three Add-ons.
 * If the phone number is classified as spam by any of the two integrations, the
 * call is rejected. If the number isn't categorized as spam, the call will go through.
 *
 * Contents:
 * 1. Input Helpers
 * 2. Main Handler
 */

/*
 * 1. Input Helpers
 * These helper functions help read the results from the spam Add-ons
 * in the incoming voice TwiML callback.
 *
 * Function will return true if the call is classified as spam.
 * Otherwise, it will return false.
 */

function blockedByMarchex(response) {
  if (!response || response.status !== 'successful') {
    return false;
  }

  return response.result.result.recommendation === 'BLOCK';
}

function blockedByNomorobo(response) {
  if (!response || response.status !== 'successful') {
    return false;
  }

  return response.result.score === 1;
}
/**
 * 2. Main Handler
 *
 * This is the entry point to your Twilio Function,
 * which will create a new Voice Response using Twiml based on
 * the spam filters. If the call is flagged as spam by any of the
 * spam filtering add-ons, the call will blocked by the <Reject> Twiml
 * verb. Else, the call will proceed and the Voice Response
 * will respond to the caller with a greeting.
 *
 * The callback will be used to return from your function
 * with the Twiml Voice Response you defined earlier.
 * In the callback in non-error situations, the first
 * parameter is null and the second parameter
 * is the value you want to return.
 */
exports.handler = function (context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();

  let blockCalls = false;

  /*
   * If the request body contains add-ons, check to see if any of
   * the spam filtering add-ons have flagged the number.
   */
  const addOns = 'AddOns' in event && JSON.parse(event.AddOns);
  if (addOns && addOns.status === 'successful') {
    const { results } = addOns;
    blockCalls =
      blockedByMarchex(results.marchex_cleancall) ||
      blockedByNomorobo(results.nomorobo_spamscore);
  }

  if (blockCalls) {
    twiml.reject();
  } else {
    // Add instructions here on what to do if call goes through
    twiml.say('Welcome to the jungle.');
    twiml.hangup();
  }

  callback(null, twiml);
};
