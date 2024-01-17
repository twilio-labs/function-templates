import { afterAll, beforeAll, jest } from '@jest/globals';

jest.unstable_mockModule('airtable', () => {
  const mockAirtableTable = {
    create: jest.fn(() =>
      Promise.resolve({
        err: 'This is an error message',
      })
    ),
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
  return jest.fn().mockImplementation(() => {
    return mockAirtableClient;
  });
});
import Airtable from 'airtable';
import helpers from '../../test/test-helper';
import saveSms from '../functions/save-sms.protected';
import Twilio from 'twilio';

const event = {};

const context = {
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

test('returns a MessageResponse', (done) => {
  const callback = (_err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
    done();
  };

  saveSms(context, event, callback);
});

test('successfully saved the message', (done) => {
  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      '<Message>The SMS was successfully saved.</Message>'
    );
    done();
  };

  saveSms(context, event, callback);
});
