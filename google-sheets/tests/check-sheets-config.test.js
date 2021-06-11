const helpers = require('../../test/test-helper');
const checkConfig = require('../functions/check-sheets-config').handler;
const { google } = require('googleapis');

const event = {};

jest.mock('googleapis');

google.auth.JWT.mockReturnValue();
google.sheets.mockReturnValue({
  spreadsheets: {
    values: {
      get: jest.fn(() => Promise.resolve()),
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

it('should return a success message for a valid configuration', (done) => {
  const callback = (err, res) => {
    expect(err).toBeFalsy();
    expect(res._body.success).toBeTruthy();
    expect(res._body.message).toMatch(
      'Google Sheets integration is configured properly.'
    );
    done();
  };

  checkConfig(context, event, callback);
});

it('should handle Google Sheets API errors', (done) => {
  const errorMessage = 'generic test error';
  google.sheets.mockReturnValueOnce({
    spreadsheets: {
      values: {
        get: jest.fn(() =>
          // eslint-disable-next-line prefer-promise-reject-errors
          Promise.reject({
            code: 401,
            message: errorMessage,
          })
        ),
      },
    },
  });

  const callback = (_err, res) => {
    expect(res._body.success).toBeFalsy();
    done();
  };

  checkConfig(context, event, callback);
});

it('should handle a missing Google Sheets document', (done) => {
  google.sheets.mockReturnValueOnce({
    spreadsheets: {
      values: {
        get: jest.fn(() =>
          // eslint-disable-next-line prefer-promise-reject-errors
          Promise.reject({
            code: 404,
          })
        ),
      },
    },
  });

  const callback = (_err, res) => {
    expect(res._body.success).toBeFalsy();
    expect(res._body.message).toEqual(
      'Could not find your Google Sheets document. Please ensure DOCUMENT_ID is correct.'
    );
    done();
  };

  checkConfig(context, event, callback);
});

it('should log Google Sheets API errors', (done) => {
  const testError = 'API test error';
  google.sheets.mockReturnValueOnce({
    spreadsheets: {
      values: {
        get: jest.fn(() =>
          // eslint-disable-next-line prefer-promise-reject-errors
          Promise.reject({
            code: 400,
            errors: [{ message: testError }],
          })
        ),
      },
    },
  });

  const callback = (_err, res) => {
    expect(res._body.success).toBeFalsy();
    done();
  };

  checkConfig(context, event, callback);
});
