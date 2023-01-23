const helpers = require('../../test/test-helper');
const auth = require('../functions/auth.private');
const Twilio = require('twilio');

const context = {};
const event = {};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

describe('studio-quick-deploy-test auth function', () => {
  it('Does something', () => {
    console.log('Something');
  });
});
