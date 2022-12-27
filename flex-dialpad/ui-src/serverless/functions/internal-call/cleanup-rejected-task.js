const TokenValidator = require('twilio-flex-token-validator').functionValidator;
const ParameterValidator = require(Runtime.getFunctions()[
  'common/helpers/parameter-validator'
].path);
const ConferenceOperations = require(Runtime.getFunctions()[
  'common/twilio-wrappers/conference-participant'
].path);

exports.handler = TokenValidator(async function cleanupRejectedTask(
  context,
  event,
  callback
) {
  const scriptName = arguments.callee.name;
  const response = new Twilio.Response();
  const requiredParameters = [
    { key: 'taskSid', purpose: 'unique ID of task to clean up' },
  ];
  const parameterError = ParameterValidator.validate(
    context.PATH,
    event,
    requiredParameters
  );

  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (parameterError) {
    console.error(`${scriptName} invalid parameters passed`);
    response.setStatusCode(400);
    response.setBody({ data: null, message: parameterError });
    callback(null, response);
    return;
  }

  const { taskSid } = event;

  const conferencesResponse = await ConferenceOperations.fetchByTask({
    context,
    scriptName,
    taskSid,
    status: 'in-progress',
    limit: 20,
    attempts: 0,
  });

  if (!conferencesResponse.success) {
    callback(null, assets.response('json', {}));
    return;
  }

  await Promise.all(
    conferencesResponse.conferences.map((conference) => {
      return ConferenceOperations.updateConference({
        context,
        scriptName,
        conference: conference.sid,
        updateParams: { status: 'completed' },
        attempts: 0,
      });
    })
  );

  response.setBody({});
  callback(null, response);
});
