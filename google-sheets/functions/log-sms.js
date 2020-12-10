const { google } = require('googleapis');

exports.handler = async function(context, event, callback) {
  // Assemble an authentication JWT from a service account email and private
  // key provided as environment variables:
  const auth = new google.auth.JWT(
    context.SHEETS_CLIENT_EMAIL,
    null,
    context.SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
    [ 'https://www.googleapis.com/auth/spreadsheets' ],
  );
  const twiml = new Twilio.twiml.MessagingResponse();

  try {
    const sheets = google.sheets({
      version: 'v4',
      auth,
    });

    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: context.SHEETS_DOC_ID,
      range: `'${context.SHEETS_SHEET_NAME}'`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [event.SmsSid, event.From, event.Body]
        ],
      }});

    twiml.message('The SMS was successfully saved.');
    callback(null, twiml);
  } catch (error) {
    if (error.code === 404) {
      console.error('Could not find your Google Sheets document. Please ensure SHEETS_DOC_ID is correct.');
    }
    else if (error.code === 400 && error.errors && error.errors[0] && error.errors[0].message) {
      console.error(`Google sheets error: ${error.errors[0].message}. Please ensure SHEETS_SHEET_NAME is a valid spreadsheet inside your document.`);
    }
    callback(error);
  }
};
