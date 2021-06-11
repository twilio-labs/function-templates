exports.handler = async function(context, event, callback) {

  const assets = Runtime.getAssets();
  const autopilotDefinition = require(assets["/autopilot-bot.js"].path);
  callback(null, autopilotDefinition);
  return;

};