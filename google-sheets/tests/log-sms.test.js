const helpers = require('../../test/test-helper');
const logSms = require('../functions/log-sms').handler;
const { google } = require('googleapis');

const event = {};

jest.mock('googleapis');

google.auth.JWT.mockReturnValue();
google.sheets.mockReturnValue({
  spreadsheets: {
    values: {
      append: jest.fn(() => Promise.resolve())
    },
  },
});

const context = {
  SHEETS_CLIENT_EMAIL: 'test@example.com',
  SHEETS_PRIVATE_KEY: '1234testkey',
  SHEETS_DOC_ID: 'appAbcD12efG3HijK',
  SHEETS_SHEET_NAME: 'Sheet1',
};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

it('should successfully save the message', done => {
  const callback = (err, result) => {
    expect(err).toBeFalsy();
    expect(result.toString()).toMatch('<Message>The SMS was successfully saved.</Message>');
    done();
  };

  logSms(context, event, callback);
});

it('should handle missing document IDs', done => {
  google.sheets.mockReturnValueOnce({
    spreadsheets: {
      values: {
        append: jest.fn(() => Promise.reject({
          code: 404,
        }))
      },
    },
  });

  const callback = (err, _result) => {
    expect(err.code).toEqual(404);
    done();
  };

  logSms(context, event, callback);
});

it('should handle Google Sheets API errors', done => {
  google.sheets.mockReturnValueOnce({
    spreadsheets: {
      values: {
        append: jest.fn(() => Promise.reject({
          code: 400,
          errors: [{ message: 'test Google Sheets API error' }]
        }))
      },
    },
  });

  const callback = (err, _result) => {
    expect(err.code).toEqual(400);
    done();
  };

  logSms(context, event, callback);
});
