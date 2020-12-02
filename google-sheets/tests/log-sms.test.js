const helpers = require('../../test/test-helper');
const logSms = require('../functions/log-sms').handler;
const Twilio = require('twilio');

const event = {};

const mockGoogleClient = {
  google: {
    auth: {
      GoogleAuth: jest.fn(),
    },
    sheets: jest.fn(() => ({
      spreadsheets: {
        values: {
          append: jest.fn(() => Promise.resolve())
        },
      },
    })),
  }
};

jest.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: jest.fn(),
    },
    sheets: jest.fn(() => ({
      spreadsheets: {
        values: {
          append: jest.fn(() => Promise.resolve())
        },
      },
    })),
  }
}));

const context = {
  SHEETS_DOC_ID: 'appAbcD12efG3HijK',
  SHEETS_SHEET_NAME: 'Sheet1',
  SHEETS_SERVICE_ACCOUNT_JSON: './assets/auth.json',
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

  logSms(context, event, callback);
});

test('successfully saved the message', done => {
  const callback = (err, result) => {
    expect(result.toString()).toMatch('<Message>The SMS was successfully saved.</Message>');
    done();
  };

  logSms(context, event, callback);
});
