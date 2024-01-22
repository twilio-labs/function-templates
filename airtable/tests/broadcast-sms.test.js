import { afterAll, beforeAll, jest } from '@jest/globals';
import helpers from '../../test/test-helper';

const event = {};

const mockRecord = {
  get: jest.fn(() => '+1234567890'),
};
const mockAllRecords = [mockRecord];

const mockAirtableQuery = {
  all: jest.fn(() => Promise.resolve(mockAllRecords)),
};

const mockAirtableTable = {
  select: jest.fn(() => {
    return mockAirtableQuery;
  }),
};

const mockAirtableBase = {
  table: jest.fn().mockImplementation(() => {
    return mockAirtableTable;
  }),
};

const mockAirtableClient = {
  base: jest.fn().mockImplementation(() => {
    return mockAirtableBase;
  }),
};

jest.mock('airtable', () => {
  return jest.fn().mockImplementation(() => {
    return mockAirtableClient;
  });
});

const broadcastSms = (await import('../functions/broadcast-sms')).default;

const shouldFail = false;
const mockClient = {
  messages: {
    create: jest.fn(async () => {
      if (shouldFail) {
        throw new Error('failed to send mock sms');
      } else {
        return {
          sid: 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        };
      }
    }),
  },
};

const context = {
  getTwilioClient: () => mockClient,
  AIRTABLE_API_KEY: 'keyAbcD12efG3HijK',
  AIRTABLE_BASE_ID: 'appAbcD12efG3HijK',
  AIRTABLE_TABLE_NAME: 'Table 1',
  TWILIO_PHONE_NUMBER: 'TwilioNumber',
};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('returns a Response', (done) => {
  const callback = (_err, result) => {
    expect(result).toBeDefined();
    done();
  };

  broadcastSms(context, event, callback);
});

test('sends an SMS message', (done) => {
  const callback = (_err, _result) => {
    expect(mockClient.messages.create).toHaveBeenCalledWith({
      from: 'TwilioNumber',
      to: '+1234567890',
      body: 'This is a broadcast message from Twilio.',
    });
    done();
  };

  broadcastSms(context, event, callback);
});
