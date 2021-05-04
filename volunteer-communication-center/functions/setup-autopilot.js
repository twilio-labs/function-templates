/* eslint-disable no-console, func-names */
exports.handler = async function (context, event, callback) {

  const assets = Runtime.getAssets();
  const autopilotDefinition = require(assets["/autopilot_bot.js"].path);
  const path = Runtime.getFunctions()['auth'].path;
  const { getCurrentEnvironment, setEnvironmentVariable } = require(path);

  const client = context.getTwilioClient();

  function createAssistant() {
    return client.autopilot.assistants
    .create({
       friendlyName: autopilotDefinition["friendlyName"],
       uniqueName: autopilotDefinition["uniqueName"],
       styleSheet: autopilotDefinition["styleSheet"]
     })
    .then(assistant => assistant)
    .catch((err) => { throw new Error(err.details) });
  }

  function updateDefaults(assistant) {
    return client.autopilot.assistants(assistant.sid)
    .defaults()
    .update({defaults: {
       defaults: {
         assistant_initiation: "task://greeting",
         fallback: "task://fallback",
         collect : {
          validate_on_failure : "task://collect_fallback"
      }
       }
     }})
    .then(defaults => console.log(defaults.assistantSid))
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
  await updateDefaults(assistant);
  const environment = await getCurrentEnvironment(context);
  // No environment exists when developing locally
  if(environment) {
    await setAutopilotSidEnvVar(environment, assistant.sid);
  } else {
    process.env.AUTOPILOT_SID = assistant.sid;
  }

  callback(null, assistant.sid);
};
