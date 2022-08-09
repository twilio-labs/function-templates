const { runE2eTestSuite } = require('../_helpers/test-suite');

runE2eTestSuite({
  env: {
    VERIFY_SERVICE_SID: 'SID',
  },
});
