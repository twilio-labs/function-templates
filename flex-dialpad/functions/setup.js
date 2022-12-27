exports.handler = async function (context, event, callback) {
  const { setupProject, isConfigured } = require(Runtime.getAssets()[
    '/helpers/setup.js'
  ].path);

  if (!isConfigured(context)) {
    const setupDone = await setupProject(context);
    callback(null, { setup: setupDone });
  }
};
