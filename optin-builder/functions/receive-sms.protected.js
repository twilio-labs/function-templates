exports.handler = function (context, event, callback) {
  const stopKeywords = [
    'cancel',
    'end',
    'quit',
    'stop',
    'stopall',
    'unsubscribe',
  ];
  const startKeywords = ['start', 'unstop', 'yes'];
  const { path } = Runtime.getFunctions().utils;
  const {
    segmentOptIn,
    webhookOptIn,
    airtableCreateOptIn,
    airtableRemoveOptIn,
  } = require(path);

  // Lowercase everything so that we're case insensitive
  const message = event.Body.toLowerCase();
  const optInKeyword = context.OPT_IN_KEYWORD.toLowerCase();

  const Airtable = require('airtable');
  const base = new Airtable({ apiKey: context.AIRTABLE_API_KEY }).base(
    context.AIRTABLE_BASE_ID
  );

  const Analytics = require('analytics-node');
  const analytics = new Analytics(context.SEGMENT_WRITE_KEY);

  if (message === optInKeyword || startKeywords.includes(message)) {
    const twiml = new Twilio.twiml.MessagingResponse();
    twiml.message(context.SUBSCRIBE_CONFIRMATION);

    if (context.DATA_SOURCE === 'airtable') {
      airtableCreateOptIn(twiml, base, context, event, callback);
    } else if (context.DATA_SOURCE === 'segment') {
      segmentOptIn(twiml, true, analytics, event, callback);
    } else if (context.DATA_SOURCE === 'webhook') {
      webhookOptIn(twiml, true, context, event, callback);
    } else {
      console.log('No data source set.');
      return callback(null, twiml);
    }
  } else if (stopKeywords.includes(message)) {
    if (context.DATA_SOURCE === 'airtable') {
      airtableRemoveOptIn(base, context, event, callback);
    } else if (context.DATA_SOURCE === 'segment') {
      segmentOptIn(null, false, analytics, event, callback);
    } else if (context.DATA_SOURCE === 'webhook') {
      webhookOptIn(null, false, context, event, callback);
    } else {
      console.log('No data source set.');
      return callback(null, null);
    }
  }

  // Your application code goes here!
  return callback(null, null);
};
