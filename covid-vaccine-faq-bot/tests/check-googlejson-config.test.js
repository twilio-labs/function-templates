const helpers = require('../../test/test-helper');
const checkConfig = require('../functions/check-googlejson-config').handler;

const event = {};

const context = {
  GOOGLE_APPLICATION_CREDENTIALS: '/service-account-key.json',
};

beforeAll(() => {
  const runtime = new helpers.MockRuntime();
  runtime._addAsset(
    '/service-account-key.json',
    './service-account-key.test.json'
  );
  helpers.setup(context, runtime);
});

afterAll(() => {
  helpers.teardown();
});

it('should return a success message for a valid configuration', (done) => {
  const callback = (err, res) => {
    expect(err).toBeFalsy();
    expect(res._body.success).toBeTruthy();
    expect(res._body.message).toMatch(
      'Google service account key is configured properly.'
    );
    done();
  };

  checkConfig(context, event, callback);
});
