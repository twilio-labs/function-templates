const { google } = require('googleapis');

exports.handler = async function(context, event, callback) {
  const auth = new google.auth.GoogleAuth({
    keyFile: context.SHEETS_SERVICE_ACCOUNT_JSON,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
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
    console.log({ error });
    callback(error);
  }
};
