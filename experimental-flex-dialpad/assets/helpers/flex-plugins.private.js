const axios = require('axios');
const helpers = require('@twilio-labs/runtime-helpers');
const querystring = require('querystring');
const { TwilioServerlessApiClient } = require('@twilio-labs/serverless-api');
const {
  createService,
  findServiceSid,
} = require('@twilio-labs/serverless-api/dist/api/services');
const {
  listEnvironments,
} = require('@twilio-labs/serverless-api/dist/api/environments');
const {
  getBuild,
  triggerBuild,
  getBuildStatus,
  activateBuild,
} = require('@twilio-labs/serverless-api/dist/api/builds');
const {
  getOrCreateAssetResources,
  uploadAsset,
} = require('@twilio-labs/serverless-api/dist/api/assets');
const {
  removeEnvironmentVariables,
} = require('@twilio-labs/serverless-api/dist/api/variables');

const Status = {
  NOT_STARTED: 'not-started',
  BUILDING: 'building',
  READY_TO_DEPLOY: 'ready-to-deploy',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

exports.Status = Status;

async function loadPluginData(context, pluginName, replacementMap) {
  return ['.js', '.js.LICENSE.txt', '.js.map'].map((suffix) => {
    const filename = pluginName + suffix;
    let content = Runtime.getAssets()['/' + filename].open();
    Object.entries(replacementMap).forEach(([key, value]) => {
      content = content.replace(new RegExp(key, 'g'), value);
    });

    return {
      filename,
      content,
    };
  });
}

function getFlexPluginApiClient(context, jsonType) {
  return axios.default.create({
    baseURL: 'https://flex-api.twilio.com/v1',
    headers: {
      'Content-Type': jsonType
        ? 'application/json'
        : 'application/x-www-form-urlencoded',
    },
    auth: {
      username: context.ACCOUNT_SID,
      password: context.AUTH_TOKEN,
    },
  });
}

function readFlexConfigurationServiceSids(flexApiClient) {
  return flexApiClient
    .get('Configuration')
    .then((resp) => resp.serverless_service_sids || []);
}

async function registerFlexConfigurationServiceSid(
  context,
  serviceSid,
  flexApiClient
) {
  const serviceSids = await readFlexConfigurationServiceSids(flexApiClient);
  if (serviceSids.includes(serviceSid)) {
    return;
  }

  serviceSids.push(serviceSid);

  const payload = {
    account_sid: context.ACCOUNT_SID,
    serverless_service_sids: serviceSids,
  };

  return flexApiClient.post('Configuration', payload);
}

async function getFlexPluginServiceSid(serverlessApiClient, flexApiClient) {
  let [serviceSid] = await readFlexConfigurationServiceSids(flexApiClient);
  if (serviceSid) {
    return serviceSid;
  }

  serviceSid = await findServiceSid('default', serverlessApiClient);
  if (serviceSid) {
    return serviceSid;
  }

  // TODO: this doesn't allow to set a friendly name
  serviceSid = await createService('default', serverlessApiClient);
  return serviceSid;
}

async function getEnvironment(serverlessApiClient, serviceSid, pluginName) {
  const environments = await listEnvironments(serviceSid, serverlessApiClient);
  const pluginEnvironment = environments.find((environment) => {
    return environment.unique_name === pluginName;
  });
  if (pluginEnvironment) {
    return {
      sid: pluginEnvironment.sid,
      buildSid: pluginEnvironment.build_sid,
      domain_name: pluginEnvironment.domain_name,
    };
  }

  console.log('Create environment');
  try {
    const { body } = await serverlessApiClient.request(
      'post',
      `Services/${serviceSid}/Environments`,
      {
        form: {
          UniqueName: pluginName,
          // TODO: avoid naming collisions
          DomainSuffix: Math.random().toString(32).substring(2, 7),
        },
      }
    );

    console.log('result');
    return {
      sid: body.sid,
      buildSid: body.build_sid,
      domain_name: body.domain_name,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function uploadFiles(assets, serviceSid, serverlessClient) {
  const assetsToUpload = await getOrCreateAssetResources(
    assets,
    serviceSid,
    serverlessClient
  );
  return Promise.all(
    assetsToUpload.map((asset) => {
      return uploadAsset(
        asset,
        serviceSid,
        serverlessClient,
        serverlessClient.config
      );
    })
  );
}

function getAssetBaseUrl(pluginName, version) {
  return '/plugins/' + pluginName + '/' + version;
}

exports.uploadFlexPlugin = async (
  context,
  pluginName,
  version,
  replacementMap
) => {
  const serverlessClient = new TwilioServerlessApiClient({
    username: context.ACCOUNT_SID,
    password: context.AUTH_TOKEN,
  });
  const flexApiClient = getFlexPluginApiClient(context);
  const [bundleData, licenseData, sourceMapData] = await loadPluginData(
    context,
    pluginName,
    replacementMap
  );
  const pluginBaseUrl = getAssetBaseUrl(pluginName, version);
  const bundleUri = `${pluginBaseUrl}/bundle.js`;
  const sourceMapUri = `${pluginBaseUrl}/bundle.js.map`;

  const serviceSid = await getFlexPluginServiceSid(
    serverlessClient,
    flexApiClient
  );
  if (!serviceSid) {
    return [false, null];
  }

  const {
    buildSid,
    sid: environmentSid,
    domain_name,
  } = await getEnvironment(serverlessClient, serviceSid, pluginName);

  const pluginurl = `https://${domain_name}${bundleUri}`;

  let buildAssets = [];
  let buildFunctions = [];
  let buildDependencies = [];
  if (buildSid) {
    const build = await getBuild(buildSid, serviceSid, serverlessClient);
    buildAssets = build.asset_versions;
    buildDependencies = build.dependencies;
    buildFunctions = build.function_versions;
  }

  const assetsToUpload = [
    {
      access: 'protected',
      content: bundleData.content,
      name: bundleData.filename,
      path: bundleUri,
      filePath: bundleData.filename,
    },
    {
      access: 'protected',
      content: sourceMapData.content,
      name: sourceMapData.filename,
      path: sourceMapUri,
      filePath: sourceMapData.filename,
    },
  ];
  const assetSids = await uploadFiles(
    assetsToUpload,
    serviceSid,
    serverlessClient
  );

  buildAssets = [
    ...buildAssets
      .filter((x) => x.path !== bundleUri && x.path !== sourceMapUri)
      .map((x) => x.sid),
    ...assetSids,
  ];
  const payload = {
    dependencies: buildDependencies,
    functionVersions: buildFunctions.map((x) => x.sid),
    assetVersions: buildAssets,
  };
  console.log(payload);

  const { sid: newBuildSid } = await triggerBuild(
    payload,
    serviceSid,
    serverlessClient
  );

  const currentEnvironment =
    await helpers.environment.getCurrentEnvironment(context);
  await helpers.environment.setEnvironmentVariable(
    context,
    currentEnvironment,
    'IN_PROGRESS_BUILD_SID',
    newBuildSid
  );

  return [true, newBuildSid];
};

exports.getStatus = async function (context, pluginName, version) {
  const serverlessClient = new TwilioServerlessApiClient({
    username: context.ACCOUNT_SID,
    password: context.AUTH_TOKEN,
  });
  const flexApiClient = getFlexPluginApiClient(context);
  const serviceSid = await getFlexPluginServiceSid(
    serverlessClient,
    flexApiClient
  );
  const {
    buildSid,
    sid: environmentSid,
    domain_name,
  } = await getEnvironment(serverlessClient, serviceSid, pluginName);

  if (buildSid === context.IN_PROGRESS_BUILD_SID) {
    return Status.COMPLETED;
  }

  const status = await getBuildStatus(
    context.IN_PROGRESS_BUILD_SID,
    serviceSid,
    serverlessClient
  );
  if (status === 'completed') {
    return Status.READY_TO_DEPLOY;
  }

  return Status.BUILDING;
};

async function upsertFlexPlugin(pluginName, description, flexApiClient) {
  const payload = {
    UniqueName: pluginName,
    FriendlyName: pluginName,
    Description: description,
  };

  try {
    await flexApiClient.get('PluginService/Plugins/' + pluginName);
    return flexApiClient.post('PluginService/Plugins/' + pluginName, {
      FriendlyName: payload.FriendlyName,
      Description: payload.Description,
    });
  } catch (err) {
    if (err.response.status === 404) {
      console.log(payload);
      return flexApiClient.post(
        'PluginService/Plugins',
        querystring.stringify(payload)
      );
    }
    throw err;
  }
}

async function getLatestFlexPluginVersion(pluginName, flexApiClient) {
  const resp = await flexApiClient.get(
    `PluginService/Plugins/${pluginName}/Versions`
  );
  if (resp.data && resp.data.plugin_versions) {
    return resp.data.plugin_versions[0];
  }

  return undefined;
}

async function registerFlexPluginVersion(
  pluginName,
  version,
  pluginUrl,
  flexApiClient
) {
  if (!(await getLatestFlexPluginVersion(pluginName, flexApiClient))) {
    const payload = {
      Version: version,
      PluginUrl: pluginUrl,
      Private: true,
      Changelog: 'Automatic deployment from Quick Deploy',
    };
    return flexApiClient.post(
      'PluginService/Plugins/' + pluginName + '/Versions',
      querystring.stringify(payload)
    );
  }
}

async function createFlexPluginConfiguration(
  pluginName,
  version,
  flexApiClient
) {
  // TODO
}

async function releaseConfiguration() {
  // TODO
}

exports.deployPlugin = async function (
  context,
  pluginName,
  version,
  description
) {
  const serverlessClient = new TwilioServerlessApiClient({
    username: context.ACCOUNT_SID,
    password: context.AUTH_TOKEN,
  });
  const flexApiClient = getFlexPluginApiClient(context, false);
  const flexApiClientJson = getFlexPluginApiClient(context, true);
  const serviceSid = await getFlexPluginServiceSid(
    serverlessClient,
    flexApiClient
  );
  const {
    buildSid,
    sid: environmentSid,
    domain_name,
  } = await getEnvironment(serverlessClient, serviceSid, pluginName);
  const pluginBaseUrl = getAssetBaseUrl(pluginName, version);
  const bundleUri = `${pluginBaseUrl}/bundle.js`;
  const pluginUrl = `https://${domain_name}${bundleUri}`;

  await activateBuild(
    context.IN_PROGRESS_BUILD_SID,
    environmentSid,
    serviceSid,
    serverlessClient
  );
  await registerFlexConfigurationServiceSid(
    context,
    serviceSid,
    flexApiClientJson
  );
  await upsertFlexPlugin(pluginName, description, flexApiClient);
  await registerFlexPluginVersion(
    pluginName,
    version,
    pluginUrl,
    flexApiClient
  );
};
