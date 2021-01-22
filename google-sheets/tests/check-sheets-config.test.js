const helpers = require('../../test/test-helper');
const checkConfig = require('../functions/check-sheets-config').handler;
const { google } = require('googleapis');

const event = {};

jest.mock('googleapis');

google.auth.JWT.mockReturnValue();
google.sheets.mockReturnValue({
  spreadsheets: {
    values: {
      get: jest.fn(() => Promise.resolve())
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

it('should return a success message for a valid configuration', done => {
  const callback = (err, res) => {
    expect(err).toBeFalsy();
    expect(res._body.success).toBeTruthy();
    expect(res._body.message).toMatch('Google Sheets integration is configured properly.');
    done();
  };

  checkConfig(context, event, callback);
});

it('should handle Google Sheets API errors', done => {
  const errorMessage = 'generic test error';
  google.sheets.mockReturnValueOnce({
    spreadsheets: {
      values: {
        get: jest.fn(() => Promise.reject({
          code: 401,
          message: errorMessage,
        }))
      },
    },
  });

  const callback = (_err, res) => {
    expect(res._body.success).toBeFalsy();
    expect(res._body.message).toEqual(`Google Sheets integration error: ${errorMessage}`);
    done();
  };

  checkConfig(context, event, callback);
});

it('should handle a missing Google Sheets document', done => {
  google.sheets.mockReturnValueOnce({
    spreadsheets: {
      values: {
        get: jest.fn(() => Promise.reject({
          code: 404,
        }))
      },
    },
  });

  const callback = (_err, res) => {
    expect(res._body.success).toBeFalsy();
    expect(res._body.message).toEqual('Could not find your Google Sheets document. Please ensure SHEETS_DOC_ID is correct.');
    done();
  };

  checkConfig(context, event, callback);
});

it('should pass along Google Sheets API errors', done => {
  const testError = 'API test error';
  google.sheets.mockReturnValueOnce({
    spreadsheets: {
      values: {
        get: jest.fn(() => Promise.reject({
          code: 400,
          errors: [{ message: testError }],
        }))
      },
    },
  });

  const callback = (_err, res) => {
    expect(res._body.success).toBeFalsy();
    expect(res._body.message).toEqual(`Google sheets error: ${testError}. Please ensure SHEETS_SHEET_NAME is a valid spreadsheet inside your document.`);
    done();
  };

  checkConfig(context, event, callback);
});
