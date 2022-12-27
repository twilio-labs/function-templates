const { random, isNumber, isString } = require('lodash');

snooze = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {object} error the error from the calling function
 * @param {object} parameters the parameters to call the callback with
 * @param {string} parameters.scriptName the name of the top level lambda function
 * @param {number} parameters.attempts the number of retry attempts performed
 * @param {function} callback the callback function to retry
 * @returns {any}
 * @description the following method is used as a generic retry handler for method
 *   calls to the twilio client where the response code is 412, 429 or 503.
 *   Although there is a maximum runtime for twilio functions
 *   it is beneficial to retry from within the twilio function as the overhead
 *   of the retry is much lower from within the twilio function
 *   (as its in the same data center) than to go all
 *   the way back to the calling client and retry from there.
 *
 *   this is particularly useful if doing a multi transactional
 *   operation from a single twilio function call as it helps minimize
 *   failures here from the occasional 412 or 429 in particular
 *
 *   NOTE: Status codes should still be passed back and
 *   retry handler in the browser are still encouraged.
 */
exports.retryHandler = async (error, parameters, callback) => {
  if (!isNumber(parameters.attempts))
    throw 'Invalid parameters object passed. Parameters must contain the number of attempts';
  if (!isString(parameters.scriptName))
    throw 'Invalid parameters object passed. Parameters must contain scriptName of calling function';

  const {
    TWILIO_SERVICE_MAX_BACKOFF,
    TWILIO_SERVICE_MIN_BACKOFF,
    TWILIO_SERVICE_RETRY_LIMIT,
  } = process.env;
  const { attempts, scriptName } = parameters;
  const { response, message: errorMessage } = error;
  const status = response ? response.status : 500;
  const logWarning =
    attempts == 1
      ? `${parameters.attempts} retry attempt`
      : `${parameters.attempts} retry attempts`;
  const message = errorMessage ? errorMessage : error;

  if (
    (status == 412 || status == 429 || status == 503) &&
    isNumber(attempts) &&
    attempts < TWILIO_SERVICE_RETRY_LIMIT
  ) {
    console.warn(
      `retrying ${scriptName}.${callback.name}() after ${logWarning}, status code: ${status}`
    );
    if (status === 429 || status === 503)
      await snooze(
        random(TWILIO_SERVICE_MIN_BACKOFF, TWILIO_SERVICE_MAX_BACKOFF)
      );

    const updatedAttempts = attempts + 1;
    const updatedParameters = { ...parameters, attempts: updatedAttempts };
    return callback(updatedParameters);
  } else {
    console.error(
      `retrying ${scriptName}.${callback.name}() failed after ${logWarning}, status code: ${status}, message: ${message}`
    );
    return { success: false, message, status };
  }
};
