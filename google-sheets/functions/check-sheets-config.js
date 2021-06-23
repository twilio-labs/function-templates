const { google } = require('googleapis');
const fs = require('fs').promises;

const isAuthValid = (authJson) =>
  authJson.client_email &&
  authJson.client_email !== '<YOUR SERVICE ACCOUNT EMAIL ADDRESS>' &&
  authJson.private_key &&
  authJson.private_key !== '<YOUR PRIVATE KEY BLOCK HERE>';

exports.handler = async function (context, _event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    const authJson = JSON.parse(
      await fs.readFile(Runtime.getAssets()[context.GOOGLE_CREDENTIALS].path)
    );

    if (!isAuthValid(authJson)) {
      throw new Error('Invalid authentication JSON file');
    }

    const auth = new google.auth.JWT({
      email: authJson.client_email,
      key: authJson.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({
      version: 'v4',
      auth,
    });

    await sheets.spreadsheets.values.get({
      spreadsheetId: context.DOCUMENT_ID,
      range: `'${context.SHEET_NAME}'`,
    });

    response.setStatusCode(200);
    response.setBody({
      success: true,
      message: 'Google Sheets integration is configured properly.',
    });
    return callback(null, response);
  } catch (error) {
    let message =
      'Google Sheets integration error. Please check the debugger in your Twilio Console.';

    if (error.code === 404) {
      message =
        'Could not find your Google Sheets document. Please ensure DOCUMENT_ID is correct.';
    } else if (
      error.code === 400 &&
      error.errors &&
      error.errors[0] &&
      error.errors[0].message
    ) {
      console.error(
        `Google sheets error: ${error.errors[0].message}. Please ensure SHEET_NAME is a valid spreadsheet inside your document.`
      );
    } else {
      console.error(
        `Google Sheets integration error: ${error.message || error}`
      );
    }

    response.setStatusCode(error.code || 400);
    response.setBody({
      success: false,
      message,
    });
    return callback(null, response);
  }
};
