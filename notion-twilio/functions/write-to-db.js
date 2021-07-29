const superagent = require('superagent');

function parseBodyToColumns(event, maxColumns) {
  try {
    return event.Body.trim().split(',').slice(0, maxColumns);
  } catch (error) {
    throw Error('No message provided. Please include a message.');
  }
}

async function sendNotionApiRequest(properties, context) {
  try {
    superagent
      .post(`https://api.notion.com/v1/pages`, {
        properties,
        parent: {
          // eslint-disable-next-line camelcase
          database_id: `${context.DATABASE_ID}`,
        },
      })
      .set('Authorization', `Bearer ${context.NOTION_API_KEY}`)
      .set('Content-Type', 'application/json')
      .set('Notion-Version', '2021-05-13');
  } catch (error) {
    throw Error(`Error calling the Notion API: ${error}`);
  }
}

function zipColumns(columnNames, columns) {
  const properties = {};

  columns.forEach((columnText, idx) => {
    const columnName = columnNames[idx];

    properties[columnName] = [
      {
        text: {
          content: columnText,
        },
      },
    ];
  });

  return properties;
}

exports.handler = async function (context, event, callback) {
  const twiml = new Twilio.twiml.MessagingResponse();

  try {
    const columnNames = ['Name', 'Where', 'Price'];
    const columns = parseBodyToColumns(event, columnNames.length);
    const properties = zipColumns(columnNames, columns);

    const resp = await sendNotionApiRequest(properties, context);
    const columnsSent = Object.keys(properties);
    twiml.message(
      `Wrote ${columnsSent.length} columns: ${columnsSent.join(
        ', '
      )} to the Notion page!`
    );
    return callback(null, twiml);
  } catch (error) {
    twiml.message(`Error: ${error.message}`);
    return callback(null, twiml);
  }
};
