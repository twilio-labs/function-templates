const helpers = require('../../test/test-helper');
const saveSms = require('../functions/save-sms').handler;
const Twilio = require('twilio');

const event = {};

jest.mock("airtable", () => {
  return jest.fn().mockImplementation(() => {
    return mockAirtableClient;
  });
});

const mockAirtableClient = {
  base: jest.fn().mockImplementation(() => {
    return mockAirtableBase;
  })
};

const mockAirtableBase = {
  table: jest.fn().mockImplementation(() => { return mockAirtableTable; })
}

const mockAirtableTable = {
  create: jest.fn(() =>
    Promise.resolve({
      err: "This is an error message"
    })
  )
}

const context = {
  AIRTABLE_APIKEY: 'keyAbcD12efG3HijK',
  AIRTABLE_BASEID: 'appAbcD12efG3HijK',
  AIRTABLE_TABLENAME: 'Table 1',
  MY_PHONE_NUMBER: 'TwilioNumber'
};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('returns a MessageResponse', done => {
  const callback = (err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
    done();
  };

  saveSms(context, event, callback);
});

test('successfully saved the message', done => {
  const callback = (err, result) => {
    expect(result.toString()).toMatch('<Message>The SMS was successfully saved.</Message>');
    done();
  };

  saveSms(context, event, callback);
});
