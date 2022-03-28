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

const TEST_WORKER_USERNAME = 'testworker';
const context = {
  getTwilioClient: () => mockClient,
  TWILIO_PHONE_NUMBER: '+1234567890',
  WORKER_USERNAME: TEST_WORKER_USERNAME,
  PHONE_NUMBER_FOR_CUSTOMER_1: '+12223334444',
  NAME_FOR_CUSTOMER_1: 'Test Customer 1',
  PHONE_NUMBER_FOR_CUSTOMER_2: '+12223334445',
  NAME_FOR_CUSTOMER_2: 'Test Customer 2',
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

  handler(context, event, callback);
});

test('routeConversation: finds worker', async (done) => {
  const conversationSid = 'CH12345';
  const customerNumber = context.PHONE_NUMBER_FOR_CUSTOMER_1;

  const workerIdentity = await routeConversation(
    context,
    conversationSid,
    customerNumber
  );
  expect(workerIdentity).toBeDefined();
  expect(workerIdentity).toEqual(TEST_WORKER_USERNAME);

  done();
});

test('routeConversation: finds worker for customer 2', async (done) => {
  const conversationSid = 'CH12345';
  const customerNumber = context.PHONE_NUMBER_FOR_CUSTOMER_2;

  const workerIdentity = await routeConversation(
    context,
    conversationSid,
    customerNumber
  );
  expect(workerIdentity).toBeDefined();
  expect(workerIdentity).toEqual(TEST_WORKER_USERNAME);
  done();
});

test('routeConversation: no assigned worker, assigns a random', async (done) => {
  const conversationSid = 'CH12345';
  const customerNumber = '+000000';

  const workerIdentity = await routeConversation(
    context,
    conversationSid,
    customerNumber
  );
  expect(workerIdentity).toBeDefined();
  expect(workerIdentity).toEqual(TEST_WORKER_USERNAME);
  done();
});

test('routeConversation: fails when not worker is assigned', async (done) => {
  const conversationSid = 'CH12345';
  const customerNumber = '+000000';
  const context = {
    getTwilioClient: () => mockClient,
    TWILIO_PHONE_NUMBER: '+1234567890',
    PHONE_NUMBER_FOR_CUSTOMER_1: '+12223334444',
    NAME_FOR_CUSTOMER_1: 'Test Customer 1',
    PHONE_NUMBER_FOR_CUSTOMER_2: '+12223334445',
    NAME_FOR_CUSTOMER_2: 'Test Customer 2',
  };

  await expect(
    routeConversation(context, conversationSid, customerNumber)
  ).rejects.toThrow();
  done();
});

test('routeConversationToWorker', async (done) => {
  const conversationSid = 'CH12345';
  const workerIdentity = TEST_WORKER_USERNAME;

  const conversation = await routeConversationToWorker(
    context.getTwilioClient(),
    conversationSid,
    workerIdentity
  );
  expect(conversation).toBeDefined();
  done();
});

test('routeConversationToWorker: fails if no Twilio client present', async (done) => {
  const conversationSid = 'CH12345';
  const workerIdentity = TEST_WORKER_USERNAME;

  await expect(
    routeConversationToWorker(
      'not-a-twilio-client',
      conversationSid,
      workerIdentity
    )
  ).rejects.toThrow();
  done();
});
