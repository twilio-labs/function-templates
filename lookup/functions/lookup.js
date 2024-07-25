// pulls nested error codes from response data
function getErrorLinks(data) {
  const hasErrorCode = (value) =>
    value !== null &&
    typeof value !== 'undefined' &&
    value.hasOwnProperty('error_code') &&
    value.error_code !== null;

  const errors = Object.entries(data)
    .filter(([_, v]) => hasErrorCode(v))
    .map(([k, v]) => [k, v.error_code]);

  return errors.map(([k, errorCode]) => {
    return `${k} error: <a href="https://www.twilio.com/docs/api/errors/${errorCode}" target="_blank">${errorCode}</a>`;
  });
}

exports.getErrorLinks = getErrorLinks;

/**
 *  Lookup - validate a phone number
 *
 *  This function will tell you whether or not a phone number is valid using Twilio's Lookup API
 *  It will also provide additional information about the phone number depending on which data packages are requested
 *
 *  Parameters:
 *  "phone" - string - phone number in E.164 format (https://www.twilio.com/docs/glossary/what-e164)
 *  "fields" - array - optional - list of fields to return from the Lookup API
 */
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    const client = context.getTwilioClient();

    const { phone, fields } = event;
    if (phone === '' || typeof phone === 'undefined') {
      throw new Error('Missing parameter; please provide a phone number.');
    }

    const lookups = await client.lookups.v2
      .phoneNumbers(event.phone)
      .fetch({ fields: fields.join(',') });

    if (!lookups.valid) {
      throw new Error(`Invalid phone number: ${lookups.validationErrors}.`);
    }

    const errors = getErrorLinks(lookups);
    if (errors.length > 0) {
      throw new Error(`${errors.join('<br/>')}`);
    }

    response.setStatusCode(200);
    response.setBody(lookups);
    return callback(null, response);
  } catch (error) {
    console.error(error.message);
    response.setStatusCode(error.status || 400);
    response.setBody({ error: error.message });
    return callback(null, response);
  }
};
