const helpers = require('../../test/test-helper');
const broadcastSms = require('../functions/broadcast-sms').handler;
const Twilio = require('twilio');

const event = {};

jest.mock('airtable', () => {
  return jest.fn().mockImplementation(() => {
    return mockAirtableClient;
  });
});

const mockRecord = {
  get: jest.fn(() => '+1234567890'),
};
const mockAllRecords = [mockRecord];

const mockAirtableClient = {
  base: jest.fn().mockImplementation(() => {
    return mockAirtableBase;
  }),
};

const mockAirtableBase = {
  table: jest.fn().mockImplementation(() => {
    return mockAirtableTable;
  }),
};

const mockAirtableTable = {
  select: jest.fn(() => {
    return mockAirtableQuery;
  }),
};

const mockAirtableQuery = {
  all: jest.fn(() => Promise.resolve(mockAllRecords)),
};

let shouldFail = false;
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
  AIRTABLE_APIKEY: 'keyAbcD12efG3HijK',
  AIRTABLE_BASEID: 'appAbcD12efG3HijK',
  AIRTABLE_TABLENAME: 'Table 1',
  TWILIO_PHONE_NUMBER: 'TwilioNumber',
};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('returns a Response', (done) => {
  const callback = (err, result) => {
    expect(result).toBeDefined();
    done();
  };

  broadcastSms(context, event, callback);
});

test('sends an SMS message', (done) => {
  const callback = (err, result) => {
    expect(mockClient.messages.create).toHaveBeenCalledWith({
      from: 'TwilioNumber',
      to: '+1234567890',
      body: 'This is a broadcast message from Twilio.',
    });
    done();
  };

  broadcastSms(context, event, callback);
});
