const { getConfig } = require('./e2e-config');
const { startLocalTestServer } = require('./serverless');
const { runTests } = require('./cypress');

async function runE2eTestSuite({ baseDir, env, cypressOptions } = {}) {
  const config = await getConfig(
    baseDir || process.cwd(),
    env || {},
    cypressOptions
  );

  try {
    console.log('>>> Start local server');
    const localDevServer = await startLocalTestServer(config.serverless);
    console.log('>>> Run Cypress Tests');
    const result = await runTests(config.cypress);
    console.log('>>> Shutdown local server');
    localDevServer.close();
    if (result.status === 'failed' || result.totalFailed > 0) {
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }
  } catch (err) {
    console.error(err);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
}

module.exports = {
  runE2eTestSuite,
};
