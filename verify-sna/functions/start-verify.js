/**
 * Start Verification
 *
 * Creates a new SNA verification for a give phone number
 *
 * Pre-requisites
 * - Create a Verify Service (https://www.twilio.com/console/verify/services)
 * - Add VERIFY_SERVICE_SID from above to your Environment Variables (https://www.twilio.com/console/functions/configure)
 * - Enable ACCOUNT_SID and AUTH_TOKEN in your functions configuration (https://www.twilio.com/console/functions/configure)
 *
 * Returns JSON
 *
 * on Success:
 * {
 *      "snaUrl": string
 * }
 *
 * on Error:
 * {
 *      "message": string
 * }
 */
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    const client = context.getTwilioClient();
    const service = context.VERIFY_SERVICE_SID;

    const [countryCode, phoneNumber] = [event.countryCode, event.phoneNumber];

    // TODO: Check that country code and phone number are present and correct

    /**
     * const verification = await client.verify
     * .services(service)
     * .verifications
     * .create({to: countryCode + phoneNumber, channel: 'sna'});
     */

    const verification = {
      sna: {
        url: 'https://mi.dnlsrv.com/m/id/3tHbGDGD?data=TGSDDSFSD4',
      },
    };

    response.setStatusCode(200);
    response.setBody({
      snaUrl: verification.sna.url,
    });
    return callback(null, response);
  } catch (error) {
    const statusCode = error.status || 400;
    response.setStatusCode(statusCode);
    response.setBody({
      message: error.message,
    });
    return callback(null, response);
  }
};
