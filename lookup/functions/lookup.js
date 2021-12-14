/**
 *  Lookup - validate a phone number
 *
 *  This function will tell you whether or not a phone number is valid using Twilio's Lookup API
 *
 *  Parameters:
 *  "phone" - string - phone number in E.164 format (https://www.twilio.com/docs/glossary/what-e164)
 */

const { createCORSResponse } = require('@twilio-labs/runtime-helpers').response;

// eslint-disable-next-line consistent-return
exports.handler = async function (context, event, callback) {
  // set to true to support CORS
  const supportCors = false;
  /* istanbul ignore next */
  const response = supportCors
    ? createCORSResponse('*')
    : new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    if (event.phone === '' || typeof event.phone === 'undefined') {
      throw new Error('Missing parameter; please provide a phone number.');
    }

    const types = typeof event.types === 'object' ? event.types : [event.types];
    const client = context.getTwilioClient();
    const pn = await client.lookups
      .phoneNumbers(event.phone)
      .fetch({ type: types });

    response.setStatusCode(200);
    response.setBody(pn);
    return callback(null, response);
  } catch (error) {
    console.error(error.message);
    response.setStatusCode(error.status || 400);
    response.setBody({ error: error.message });
    return callback(null, response);
  }
};
