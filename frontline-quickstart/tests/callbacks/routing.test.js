const helpers = require('../../../test/test-helper');
const {
  handler,
  routeConversationToWorker,
  routeConversation,
} = require('../../functions/callbacks/routing.protected');

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

const TEST_SSO_USERNAME = 'testworker';
const context = {
  getTwilioClient: () => mockClient,
  TWILIO_PHONE_NUMBER: '+1234567890',
  SSO_USERNAME: TEST_SSO_USERNAME,
  EXAMPLE_CUSTOMER_1_PHONE_NUMBER: '+12223334444',
  EXAMPLE_CUSTOMER_2_PHONE_NUMBER: '+12223334445',
};

beforeAll(() => {
  helpers.setup(context);
  const runtime = new helpers.MockRuntime();
  runtime._addAsset(
    '/providers/customers.js',
    '../../assets/providers/customers.private.js'
  );
  helpers.setup({}, runtime);
});

afterAll(() => {
  helpers.teardown();
});

test('routing callback', async () => {
  const event = {
    ConversationSid: 'CH12345',
    'MessagingBinding.Address': context.EXAMPLE_CUSTOMER_1_PHONE_NUMBER,
  };

  const callback = (_err, result) => {
    expect(_err).toBeFalsy();
    expect(result).toBeDefined();
  };

  handler(context, event, callback);
});

test('routeConversation: finds worker', async () => {
  const conversationSid = 'CH12345';
  const customerNumber = context.EXAMPLE_CUSTOMER_1_PHONE_NUMBER;

  const workerIdentity = await routeConversation(
    context,
    conversationSid,
    customerNumber
  );
  expect(workerIdentity).toBeDefined();
  expect(workerIdentity).toEqual(TEST_SSO_USERNAME);
});

test('routeConversation: finds worker for customer 2', async () => {
  const conversationSid = 'CH12345';
  const customerNumber = context.EXAMPLE_CUSTOMER_2_PHONE_NUMBER;

  const workerIdentity = await routeConversation(
    context,
    conversationSid,
    customerNumber
  );
  expect(workerIdentity).toBeDefined();
  expect(workerIdentity).toEqual(TEST_SSO_USERNAME);
});

test('routeConversation: no assigned worker, assigns a random', async () => {
  const conversationSid = 'CH12345';
  const customerNumber = '+000000';

  const workerIdentity = await routeConversation(
    context,
    conversationSid,
    customerNumber
  );
  expect(workerIdentity).toBeDefined();
  expect(workerIdentity).toEqual(TEST_SSO_USERNAME);
});

test('routeConversation: fails when not worker is assigned', async () => {
  const conversationSid = 'CH12345';
  const customerNumber = '+000000';
  const context = {
    getTwilioClient: () => mockClient,
    TWILIO_PHONE_NUMBER: '+1234567890',
    EXAMPLE_CUSTOMER_1_PHONE_NUMBER: '+12223334444',
    CUSTOMER_1_NAME: 'Test Customer 1',
    EXAMPLE_CUSTOMER_2_PHONE_NUMBER: '+12223334445',
    CUSTOMER_2_NAME: 'Test Customer 2',
  };

  await expect(
    routeConversation(context, conversationSid, customerNumber)
  ).rejects.toThrow();
});

test('routeConversationToWorker', async () => {
  const conversationSid = 'CH12345';
  const workerIdentity = TEST_SSO_USERNAME;

  const conversation = await routeConversationToWorker(
    context.getTwilioClient(),
    conversationSid,
    workerIdentity
  );
  expect(conversation).toBeDefined();
});

test('routeConversationToWorker: fails if no Twilio client present', async () => {
  const conversationSid = 'CH12345';
  const workerIdentity = TEST_SSO_USERNAME;

  await expect(
    routeConversationToWorker(
      'not-a-twilio-client',
      conversationSid,
      workerIdentity
    )
  ).rejects.toThrow();
});
