const { isString, isBoolean, isNumber, isObject } = require('lodash');

const retryHandler = require(Runtime.getFunctions()[
  'common/twilio-wrappers/retry-handler'
].path).retryHandler;

/**
 * @param {object} parameters the parameters for the function
 * @param {string} parameters.scriptName the name of the top level lambda function
 * @param {number} parameters.attempts the number of retry attempts performed
 * @param {object} parameters.context the context from calling lambda function
 * @param {string} parameters.taskSid the unique task SID to modify
 * @param {string} parameters.to the phone number to add to the conference
 * @param {string} parameters.from the caller ID to use when calling the to number
 * @returns {Participant} The newly created conference participant
 * @description adds the specified phone number as a conference participant
 */
exports.addParticipant = async (parameters) => {
  const { context, taskSid, to, from } = parameters;

  if (!isObject(context))
    throw 'Invalid parameters object passed. Parameters must contain reason context object';
  if (!isString(taskSid))
    throw 'Invalid parameters object passed. Parameters must contain taskSid string';
  if (!isString(to))
    throw 'Invalid parameters object passed. Parameters must contain to string';
  if (!isString(from))
    throw 'Invalid parameters object passed. Parameters must contain from string';

  try {
    const client = context.getTwilioClient();

    const participantsResponse = await client
      .conferences(taskSid)
      .participants.create({
        to,
        from,
        earlyMedia: true,
        endConferenceOnExit: false,
      });

    return { success: true, participantsResponse, status: 200 };
  } catch (error) {
    return retryHandler(error, parameters, arguments.callee);
  }
};

/**
 * @param {object} parameters the parameters for the function
 * @param {string} parameters.scriptName the name of the top level lambda function
 * @param {number} parameters.attempts the number of retry attempts performed
 * @param {object} parameters.context the context from calling lambda function
 * @param {string} parameters.conference the unique conference SID with the participant
 * @param {string} parameters.participant the unique participant SID to modify
 * @param {boolean} parameters.hold whether to hold or unhold the participant
 * @returns {Participant} The newly updated conference participant
 * @description holds or unholds the given conference participant
 */
exports.holdParticipant = async (parameters) => {
  const { context, conference, participant, hold } = parameters;

  if (!isObject(context))
    throw 'Invalid parameters object passed. Parameters must contain reason context object';
  if (!isString(conference))
    throw 'Invalid parameters object passed. Parameters must contain conference string';
  if (!isString(participant))
    throw 'Invalid parameters object passed. Parameters must contain participant string';
  if (!isBoolean(hold))
    throw 'Invalid parameters object passed. Parameters must contain hold boolean';

  try {
    const client = context.getTwilioClient();

    const participantsResponse = await client
      .conferences(conference)
      .participants(participant)
      .update({
        hold,
      });

    return { success: true, participantsResponse, status: 200 };
  } catch (error) {
    return retryHandler(error, parameters, arguments.callee);
  }
};

/**
 * @param {object} parameters the parameters for the function
 * @param {string} parameters.scriptName the name of the top level lambda function
 * @param {number} parameters.attempts the number of retry attempts performed
 * @param {object} parameters.context the context from calling lambda function
 * @param {string} parameters.conference the unique conference SID with the participant
 * @param {string} parameters.participant the unique participant SID to remove
 * @returns empty response object
 * @description removes the given conference participant
 */
exports.removeParticipant = async (parameters) => {
  const { context, conference, participant } = parameters;

  if (!isObject(context))
    throw 'Invalid parameters object passed. Parameters must contain reason context object';
  if (!isString(conference))
    throw 'Invalid parameters object passed. Parameters must contain conference string';
  if (!isString(participant))
    throw 'Invalid parameters object passed. Parameters must contain participant string';

  try {
    const client = context.getTwilioClient();

    const participantsResponse = await client
      .conferences(conference)
      .participants(participant)
      .remove();

    return { success: true, participantsResponse, status: 200 };
  } catch (error) {
    return retryHandler(error, parameters, arguments.callee);
  }
};

/**
 * @param {object} parameters the parameters for the function
 * @param {string} parameters.scriptName the name of the top level lambda function
 * @param {number} parameters.attempts the number of retry attempts performed
 * @param {object} parameters.context the context from calling lambda function
 * @param {string} parameters.conference the unique conference SID with the participant
 * @param {string} parameters.participant the unique participant SID to modify
 * @param {boolean} parameters.endConferenceOnExit whether to end conference when the participant leaves
 * @returns {Participant} The newly updated conference participant
 * @description sets endConferenceOnExit on the given conference participant
 */
exports.updateParticipant = async (parameters) => {
  const { context, conference, participant, endConferenceOnExit } = parameters;

  if (!isObject(context))
    throw 'Invalid parameters object passed. Parameters must contain reason context object';
  if (!isString(conference))
    throw 'Invalid parameters object passed. Parameters must contain conference string';
  if (!isString(participant))
    throw 'Invalid parameters object passed. Parameters must contain participant string';
  if (!isBoolean(endConferenceOnExit))
    throw 'Invalid parameters object passed. Parameters must contain endConferenceOnExit boolean';

  try {
    const client = context.getTwilioClient();

    const participantsResponse = await client
      .conferences(conference)
      .participants(participant)
      .update({
        endConferenceOnExit,
      });

    return { success: true, participantsResponse, status: 200 };
  } catch (error) {
    return retryHandler(error, parameters, arguments.callee);
  }
};

/**
 * @param {object} parameters the parameters for the function
 * @param {string} parameters.scriptName the name of the top level lambda function
 * @param {number} parameters.attempts the number of retry attempts performed
 * @param {object} parameters.context the context from calling lambda function
 * @param {string} parameters.taskSid the task SID to fetch conferences for
 * @param {string} parameters.status the status of conference(s) to fetch
 * @param {number} parameters.limit the maximum number of conferences to retrieve
 * @returns {Conference[]} The fetched conference(s)
 * @description fetches conferences matching the given task SID and status
 */
exports.fetchByTask = async (parameters) => {
  const { context, taskSid, status, limit } = parameters;

  if (!isObject(context))
    throw 'Invalid parameters object passed. Parameters must contain reason context object';
  if (!isString(taskSid))
    throw 'Invalid parameters object passed. Parameters must contain taskSid string';
  if (!isString(status))
    throw 'Invalid parameters object passed. Parameters must contain status string';
  if (!isNumber(limit))
    throw 'Invalid parameters object passed. Parameters must contain limit number';

  try {
    const client = context.getTwilioClient();

    const conferences = await client.conferences.list({
      friendlyName: taskSid,
      status,
      limit,
    });

    return { success: true, conferences, status: 200 };
  } catch (error) {
    return retryHandler(error, parameters, arguments.callee);
  }
};

/**
 * @param {object} parameters the parameters for the function
 * @param {string} parameters.scriptName the name of the top level lambda function
 * @param {number} parameters.attempts the number of retry attempts performed
 * @param {object} parameters.context the context from calling lambda function
 * @param {string} parameters.conference the unique conference SID with the participant
 * @param {object} parameters.updateParams parameters to update on the participant
 * @returns {Conference} The newly updated conference
 * @description updates the given conference
 */
exports.updateConference = async (parameters) => {
  const { context, conference, updateParams } = parameters;

  if (!isObject(context))
    throw 'Invalid parameters object passed. Parameters must contain reason context object';
  if (!isString(conference))
    throw 'Invalid parameters object passed. Parameters must contain conference string';
  if (!isObject(updateParams))
    throw 'Invalid parameters object passed. Parameters must contain updateParams object';

  try {
    const client = context.getTwilioClient();

    const conferencesResponse = await client
      .conferences(conference)
      .update(updateParams);

    return { success: true, conferencesResponse, status: 200 };
  } catch (error) {
    return retryHandler(error, parameters, arguments.callee);
  }
};
