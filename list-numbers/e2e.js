const { runE2eTestSuite } = require('../_helpers/test-suite');

runE2eTestSuite({
  env: {
    Password: 1,
  },
});
