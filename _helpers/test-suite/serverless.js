// eslint-disable-next-line import/no-unresolved
const { LocalDevelopmentServer } = require('@twilio/runtime-handler/dev');

function listen(app, port) {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      resolve(server);
    });
  });
}

async function startLocalTestServer(serverlessConfig) {
  const functionsServer = new LocalDevelopmentServer(
    serverlessConfig.port,
    serverlessConfig
  );

  return listen(functionsServer.getApp(), serverlessConfig.port);
}

module.exports = { startLocalTestServer };
