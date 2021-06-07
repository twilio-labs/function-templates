const subscribeFunction = require('../functions/subscribe').handler;
const helpers = require('../../test/test-helper');

const mockService = {
  verificationChecks: {
    create: jest.fn(() =>
      Promise.resolve({
        sid: 'my-new-sid',
      })
    ),
  },
};

const mockClient = {
  verify: {
    services: jest.fn(() => mockService),
  },
};

const testContext = {
  VERIFY_SERVICE_SID: 'default',
  getTwilioClient: () => mockClient,
};

describe('verified-broadcast/subscribe', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  // TODO
});
