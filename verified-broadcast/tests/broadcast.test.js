const broadcastFunction = require('../functions/broadcast').handler;
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
  BROADCAST_ADMIN_NUMBER: '+12223334444',
  getTwilioClient: () => mockClient,
};

describe('verified-broadcast/broadcast', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });
});
