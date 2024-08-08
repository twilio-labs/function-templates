/**
 * Helper function to pull nested error codes from response data
 *
 * @param {object} data - response data from Twilio Lookup API
 * @returns {array} - array of error messages with links to Twilio's error code documentation
 * @example
 * const data = {
 *  identityMatch: null,
 *  callerName: {
 *    caller_type: "BUSINESS",
 *    error_code: null,
 *  },
 *  simSwap: {
 *    error_code: 60008,
 *  },
 *  callForwarding: {
 *    error_code: 60607,
 *  }
 * };
 *
 * getErrorLinks(data);
 * // returns ['simSwap error: <a href="https://www.twilio.com/docs/api/errors/60008" target="_blank">60008</a>', 'callForwarding error: <a href="https://www.twilio.com/docs/api/errors/60607">60607</a>']
 */
function getErrorLinks(data) {
  /*
   * Find a nested error code
   * In the example above, this identifies error codes
   * in simSwap and callForwarding
   */
  const hasErrorCode = (value) =>
    value !== null &&
    typeof value !== 'undefined' &&
    value.hasOwnProperty('error_code') &&
    value.error_code !== null;

  /*
   * Filter out fields that do not have an error code
   * and transform the remaining fields to an array.
   * In the example above this would return:
   * [['simSwap', 60008], ['callForwarding', 60607]]
   */
  const errors = Object.entries(data)
    .filter(([_, fieldDetails]) => hasErrorCode(fieldDetails))
    .map(([fieldName, fieldDetails]) => [fieldName, fieldDetails.error_code]);

  /*
   * Format the error codes in a human-readable way
   * with links to Twilio's error code documentation
   */
  return errors.map(([fieldName, errorCode]) => {
    return `${fieldName} error: <a href="https://www.twilio.com/docs/api/errors/${errorCode}">${errorCode}</a>`;
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
