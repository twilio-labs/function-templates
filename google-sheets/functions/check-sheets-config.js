const { google } = require('googleapis');

exports.handler = async function(context, _event, callback) {
    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/json');

    try {
        const auth = new google.auth.JWT(
            context.SHEETS_CLIENT_EMAIL,
            null,
            context.SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
            [ 'https://www.googleapis.com/auth/spreadsheets' ],
        );
        const sheets = google.sheets({
            version: 'v4',
            auth,
        });

        await sheets.spreadsheets.values.get({
            spreadsheetId: context.SHEETS_DOC_ID,
            range: `'${context.SHEETS_SHEET_NAME}'`,
        });

        response.setStatusCode(200);
        response.setBody({
            success: true,
            message: 'Google Sheets integration is configured properly.',
        });
        callback(null, response);
    } catch (error) {
        let message = `Google Sheets integration error: ${error.message || error}`;

        if (error.code === 404) {
            message = 'Could not find your Google Sheets document. Please ensure SHEETS_DOC_ID is correct.';
        }
        else if (error.code === 400 && error.errors && error.errors[0] && error.errors[0].message) {
            message = `Google sheets error: ${error.errors[0].message}. Please ensure SHEETS_SHEET_NAME is a valid spreadsheet inside your document.`;
        }

        response.setStatusCode(400);
        response.setBody({
            success: false,
            message,
        });
        callback(null, response);
    }
}
