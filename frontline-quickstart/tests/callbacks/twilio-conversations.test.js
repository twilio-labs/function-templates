/* eslint-disable camelcase */
const helpers = require('../../../test/test-helper');
const ConversationsAPIWebhooks =
  require('../../functions/callbacks/twilio-conversations.protected').handler;

const ConversationSid = 'CH12345';
const ParticipantSid = 'MB12345';

const mockConversations = {
  conversations: jest.fn(() => ({
    participants: {
      get: jest.fn(() => ({
        fetch: jest.fn(() => {
          return Promise.resolve({
            ConversationSid,
            ParticipantSid,
            update: jest.fn(() => Promise.resolve()),
            attributes: '{}',
          });
        }),
      })),
    },
  })),
};

const mockClient = { conversations: mockConversations };

const TEST_USERNAME = 'testworker';
const context = {
  getTwilioClient: () => mockClient,
  TWILIO_PHONE_NUMBER: '+1234567890',
  USERNAME: TEST_USERNAME,
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

test('Conversations API Webhooks: creates a new conversation with the message’s sender as a participant', async (done) => {
  const INCOMING_NUMBER = '+000000';
  let event = {
    EventType: 'onConversationAdd',
    'MessagingBinding.Address': INCOMING_NUMBER,
  };
  const expected = {
    friendly_name: INCOMING_NUMBER,
    attributes: '{}',
  };

  let callback = (_err, result) => {
    console.log('error ', _err);

    expect(_err).toBeFalsy();
    expect(result).toBeDefined();
    expect(result).toEqual(expected);
    done();
  };

  ConversationsAPIWebhooks(context, event, callback);

  event = {
    EventType: 'onParticipantAdded',
    ConversationSid: 'CH12345',
    ParticipantSid: 'MB12345',
    'MessagingBinding.Address': context.PHONE_NUMBER_FOR_CUSTOMER_1,
  };

  callback = (_err, result) => {
    expect(_err).toBeFalsy();
    expect(result).toBeDefined();
    done();
  };

  ConversationsAPIWebhooks(context, event, callback);
});
