const { isString, isObject } = require('lodash');

const retryHandler = require(Runtime.getFunctions()[
  'common/twilio-wrappers/retry-handler'
].path).retryHandler;

/**
 * @param {object} parameters the parameters for the function
 * @param {string} parameters.scriptName the name of the top level lambda function
 * @param {number} parameters.attempts the number of retry attempts performed
 * @param {object} parameters.context the context from calling lambda function
 * @param {string} parameters.callSid the unique call SID to fetch
 * @returns {Map} The given call's properties
 * @description fetches the given call SID's properties
 */
exports.fetchProperties = async (parameters) => {
  const { context, callSid } = parameters;

  if (!isObject(context))
    throw 'Invalid parameters object passed. Parameters must contain reason context object';
  if (!isString(callSid))
    throw 'Invalid parameters object passed. Parameters must contain callSid string';

  try {
    const client = context.getTwilioClient();

    const callProperties = await client.calls(callSid).fetch();

    return { success: true, callProperties, status: 200 };
  } catch (error) {
    return retryHandler(error, parameters, arguments.callee);
  }
};
