const assets = Runtime.getAssets();
const status = require(assets["/admin/statuses.js"].path);
const environmentFunction = status.environment;
const statusFunctions = status.statuses;

async function getStatuses(context) {
  // This should be `Promise.allSettled` with a filter, but the node version is off
  const promises = statusFunctions.map(async fn => {
    try {
      return await fn(context);
    } catch (err) {
      console.error(`Status check failed for ${fn.name}: ${err}`);
    }
  });
  const results = await Promise.all(promises);
  return results.filter(result => result !== undefined);
}

exports.handler = async function(context, event, callback) {
  context.VIRTUAL_HOST = event.virtualHost;
  const environment = await environmentFunction(context);
  const statuses = await getStatuses(context);
  callback(null, {
    environment,
    statuses
  });
};
