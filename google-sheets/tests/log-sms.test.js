const helpers = require('../../test/test-helper');
const logSms = require('../functions/log-sms.protected').handler;
const { google } = require('googleapis');

const event = {};

jest.mock('googleapis');

google.auth.JWT.mockReturnValue();
google.sheets.mockReturnValue({
  spreadsheets: {
    values: {
      append: jest.fn(() => Promise.resolve()),
    },
  },
});

const context = {
  GOOGLE_CREDENTIALS: '/auth.json',
  DOCUMENT_ID: 'appAbcD12efG3HijK',
  SHEET_NAME: 'Sheet1',
};

beforeAll(() => {
  const runtime = new helpers.MockRuntime();
  runtime._addAsset('/auth.json', './auth.test.json');
  helpers.setup(context, runtime);
});

afterAll(() => {
  helpers.teardown();
});

it('should successfully save the message', (done) => {
  const callback = (err, result) => {
    expect(err).toBeFalsy();
    expect(result.toString()).toMatch(
      '<Message>The SMS was successfully saved.</Message>'
    );
    done();
  };

  logSms(context, event, callback);
});

it('should handle missing document IDs', (done) => {
  google.sheets.mockReturnValueOnce({
    spreadsheets: {
      values: {
        append: jest.fn(() =>
          // eslint-disable-next-line prefer-promise-reject-errors
          Promise.reject({
            code: 404,
          })
        ),
      },
    },
  });

  const callback = (err, result) => {
    expect(err).toBeFalsy();
    expect(result.toString()).toMatch(
      '<Message>Failed to save to Google Sheets. Please check the debugger in your Twilio console.</Message>'
    );
    done();
  };

  logSms(context, event, callback);
});

it('should handle Google Sheets API errors', (done) => {
  google.sheets.mockReturnValueOnce({
    spreadsheets: {
      values: {
        append: jest.fn(() =>
          // eslint-disable-next-line prefer-promise-reject-errors
          Promise.reject({
            code: 400,
            errors: [{ message: 'test Google Sheets API error' }],
          })
        ),
      },
    },
  });

  const callback = (err, result) => {
    expect(err).toBeFalsy();
    expect(result.toString()).toMatch(
      '<Message>Failed to save to Google Sheets. Please check the debugger in your Twilio console.</Message>'
    );
    done();
  };

  logSms(context, event, callback);
});

it('should handle unknown errors', (done) => {
  google.sheets.mockReturnValueOnce({
    spreadsheets: {
      values: {
        append: jest.fn(() =>
          // eslint-disable-next-line prefer-promise-reject-errors
          Promise.reject({
            code: 500,
            errors: [{ message: 'test Google Sheets unknown error' }],
          })
        ),
      },
    },
  });

  const callback = (err, result) => {
    expect(err).toBeFalsy();
    expect(result.toString()).toMatch(
      '<Message>Failed to save to Google Sheets. Please check the debugger in your Twilio console.</Message>'
    );
    done();
  };

  logSms(context, event, callback);
});
