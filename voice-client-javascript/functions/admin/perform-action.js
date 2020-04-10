const assets = Runtime.getAssets();
const Actions = require(assets["/admin/actions.js"].path);
const {
  getCurrentEnvironment,
  setEnvironmentVariable,
  checkAuthorization,
} = require(assets["/admin/shared.js"].path);

exports.handler = async function (context, event, callback) {
  if (!checkAuthorization(context, event, callback)) {
    return;
  }
  const client = context.getTwilioClient();
  const environment = await getCurrentEnvironment(context);
  const actions = new Actions(client, {
    friendlyName: process.env.APP_NAME,
    DOMAIN_NAME: context.DOMAIN_NAME,
    PATH: context.PATH,
  });
  const logs = [];
  try {
    const envVars = await actions[event.action.name](event.action.params);
    if (envVars) {
      for (let [key, value] of Object.entries(envVars)) {
        const result = await setEnvironmentVariable(
          context,
          environment,
          key,
          value,
          // Do not override if we are in initialization
          envVars.INITIALIZED === undefined
        );
        logs.push(`${result ? "Successfully set" : "Did not set"} "${key}"`);
      }
    }
    callback(null, { success: true, logs });
  } catch (err) {
    console.error(err);
    callback(err, { success: false, error: err, logs });
  }
};
