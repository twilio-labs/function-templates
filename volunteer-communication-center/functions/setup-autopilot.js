/* eslint-disable no-console, func-names */
exports.handler = async function (context, event, callback) {

  const assets = Runtime.getAssets();
  const autopilotDefinition = require(assets["/autopilot-bot.js"].path);
  const path = Runtime.getFunctions()['auth'].path;
  const { getCurrentEnvironment, setEnvironmentVariable } = require(path);

  const client = context.getTwilioClient();

  function createAssistant() {
    return client.autopilot.assistants
    .create({
       friendlyName: autopilotDefinition["friendlyName"],
       uniqueName: autopilotDefinition["uniqueName"],
       styleSheet: autopilotDefinition["styleSheet"],
       defaults: autopilotDefinition["defaults"]
     })
    .catch(() => {
        return client.autopilot.assistants
        .create({
          friendlyName: autopilotDefinition["friendlyName"],
          uniqueName: autopilotDefinition["uniqueName"] + "-" + Date.now(),
          styleSheet: autopilotDefinition["styleSheet"]
        })
      })
    .then(assistant => assistant)
    .catch((err) => { throw new Error(err.details) });
  }

  function setAutopilotSidEnvVar(environment, sid) {
    return setEnvironmentVariable(
      context,
      environment,
      'AUTOPILOT_SID',
      sid
    );
  }

  const assistant = await createAssistant();
  const environment = await getCurrentEnvironment(context);
  // No environment exists when developing locally
  if(environment) {
    await setAutopilotSidEnvVar(environment, assistant.sid);
  } else {
    process.env.AUTOPILOT_SID = assistant.sid;
  }

  callback(null, assistant.sid);
};
