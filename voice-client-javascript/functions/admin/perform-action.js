const assets = Runtime.getAssets();
const Actions = require(assets["/admin/actions.js"].path);
const {getCurrentEnvironment, setEnvironmentVariable} = require(assets["/admin/environment.js"].path);

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();
  const environment = await getCurrentEnvironment(context);
    const actions = new Actions(client, {
      friendlyName: process.env.APP_NAME,
      DOMAIN_NAME: context.DOMAIN_NAME
    });
  const logs = [];
  try {
    const envVars = await actions[event.name](event.params);
    if (envVars) {
      for (let [key, value] of Object.entries(envVars)) {
        const result = await setEnvironmentVariable(
          context,
          environment,
          key,
          value
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
