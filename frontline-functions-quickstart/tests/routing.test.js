const helpers = require('../../test/test-helper');
const routingCallback =
  require('../functions/callbacks/routing.protected').handler;

const mockConversations = {
  conversations: jest.fn(() => ({
    participants: {
      create: jest.fn(() => {
        return Promise.resolve({
          sid: 'MB12345',
        });
      }),
    },
  })),
};

const mockClient = { conversations: mockConversations };

const TEST_WORKER_USERNAME = 'testworker';
const context = {
  getTwilioClient: () => mockClient,
  TWILIO_PHONE_NUMBER: '+1234567890',
  WORKER_USERNAME: TEST_WORKER_USERNAME,
  PHONE_NUMBER_FOR_CUSTOMER_1: '+12223334444',
  NAME_FOR_CUSTOMER_1: 'Test Customer 1',
  PHONE_NUMBER_FOR_CUSTOMER_2: '+12223334444',
  NAME_FOR_CUSTOMER_2: 'Test Customer 2',
};

beforeAll(() => {
  helpers.setup(context);
  const runtime = new helpers.MockRuntime();
  runtime._addAsset(
    '/providers/customers.js',
    '../assets/providers/customers.private.js'
  );
  helpers.setup({}, runtime);
});

afterAll(() => {
  helpers.teardown();
});

test('routing callback', async (done) => {
  const event = {
    ConversationSid: 'CH12345',
    'MessagingBinding.Address': context.PHONE_NUMBER_FOR_CUSTOMER_1,
  };

  const callback = (_err, result) => {
    expect(_err).toBeFalsy();
    expect(result).toBeDefined();
    done();
  };

  routingCallback(context, event, callback);
});
