exports.handler = async function (context, event, callback) {
  const { setupProject, isConfigured } = require(
    Runtime.getAssets()['/helpers/setup.js'].path
  );
  const { uploadFlexPlugin, Status, getStatus, deployPlugin } = require(
    Runtime.getAssets()['/helpers/flex-plugins.js'].path
  );
  try {
    const pluginName = 'flex-dialpad-addon';
    const version = '1.0.0';
    const description = 'Quick deployed Flex Dialpad Addon';

    if (isConfigured(context)) {
      return callback(null, { setup: true });
    }

    if (!context.IN_PROGRESS_BUILD_SID) {
      const { setupDone, VOICE_CHANNEL_SID } = await setupProject(context);
      const [uploadDone, newBuildSid] = await uploadFlexPlugin(
        context,
        pluginName,
        version,
        {
          '<QUICK_DEPLOY_SERVICE_BASE_URL>': 'https://' + context.DOMAIN_NAME,
          '<QUICK_DEPLOY_TASK_CHANNEL>': VOICE_CHANNEL_SID,
        }
      );
      return callback(null, {
        status: Status.BUILDING,
        setup: setupDone && uploadDone,
        newBuildSid,
      });
    }

    const status = await getStatus(context, pluginName, version);
    if (status === Status.COMPLETED) {
      // TODO: remove in-porgress variables
      return callback(null, { status });
    } else if (status === Status.READY_TO_DEPLOY) {
      await deployPlugin(context, pluginName, version, description);
      return callback(null, { status: Status.COMPLETED });
    } else {
      return callback(null, { status });
    }
  } catch (err) {
    if (err.name === 'AxiosError') {
      console.error(err.response);
      console.error(err.response.request);
      console.error(err.response.data);
    } else {
      console.error(err);
    }
    return callback(null, { status: Status.FAILED });
  }
};
