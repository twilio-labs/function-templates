const { fsHelpers } = require('@twilio-labs/serverless-api');

async function getLocalTestServerConfig(projectPath, port, env) {
  return {
    baseDir: __dirname,
    env,
    port,
    url: `localhost:${port}`,
    detailedLogs: false,
    live: false,
    logs: false,
    legacyMode: false,
    appName: 'test',
    forkProcess: false,
    enableDebugLogs: false,
    routes: await fsHelpers.getListOfFunctionsAndAssets(projectPath, {
      functionsFolderNames: ['functions'],
      assetsFolderNames: ['assets'],
    }),
  };
}

function getCypressConfig(projectPath, baseUrl, cypressConfig) {
  return {
    config: {
      baseUrl,
      video: false,
      screenshotOnRunFailure: false,
    },
    // spec: join('e2e', 'hello-world.spec.js'),
    project: projectPath,
    configFile: false,
    ...cypressConfig,
  };
}

async function getConfig(projectPath, env, cypressOptions = {}) {
  const { default: getPort, portNumbers } = await import('get-port');

  const port = await getPort({ port: portNumbers(8000, 8300) });

  const baseUrl = `http://localhost:${port}`;

  return {
    cypress: getCypressConfig(projectPath, baseUrl, cypressOptions),
    serverless: await getLocalTestServerConfig(projectPath, port, env),
  };
}

module.exports = { getConfig };
