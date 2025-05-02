/**
 * Handles incoming calls, performs a lookup for caller information, sends a message with the caller details, and forwards the call to a specified number.
 *
 * @param {Object} context - The context object containing environment variables and Twilio client.
 * @param {Object} event - The event object containing details of the incoming call.
 * @param {Function} callback - The callback function to return the TwiML response.
 */
exports.handler = async function (context, event, callback) {
  try {
    const client = context.getTwilioClient();

    /*
     * Lookup the incoming phone number
     * Request both the "caller_name" and "line_type_intelligence" data packages
     */
    const lookup = await client.lookups.v2
      .phoneNumbers(event.From)
      .fetch({ fields: 'caller_name,line_type_intelligence' });

    const callerName = lookup.callerName.caller_name;
    const carrierName = lookup.lineTypeIntelligence.carrier_name;

    const body = `Incoming call from ${event.From}
Name: ${callerName === null ? 'Unknown' : callerName}
Carrier: ${carrierName} (${lookup.lineTypeIntelligence.type})`;

    // Send a message to your phone number with the caller details
    await client.messages.create({
      body,
      from: context.TWILIO_PHONE_NUMBER,
      to: context.MY_PHONE_NUMBER,
    });
  } catch (error) {
    console.error(error);
  } finally {
    // Forward the call even if caller ID fails
    const twiml = new Twilio.twiml.VoiceResponse();
    twiml.dial(context.MY_PHONE_NUMBER);
    return callback(null, twiml);
  }
};
