// eslint-disable-next-line consistent-return
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

  if (message === optInKeyword || startKeywords.includes(message)) {
    const twiml = new Twilio.twiml.MessagingResponse();
    twiml.message(context.SUBSCRIBE_CONFIRMATION);

    if (context.DATA_SOURCE === 'airtable') {
      airtableCreateOptIn(twiml, context, event, callback);
    } else if (context.DATA_SOURCE === 'segment') {
      segmentOptIn(twiml, true, context, event, callback);
    } else if (context.DATA_SOURCE === 'webhook') {
      webhookOptIn(twiml, true, context, event, callback);
    } else {
      console.log('No data source set.');
      return callback(null, twiml);
    }
  } else if (stopKeywords.includes(message)) {
    if (context.DATA_SOURCE === 'airtable') {
      airtableRemoveOptIn(context, event, callback);
    } else if (context.DATA_SOURCE === 'segment') {
      segmentOptIn(null, false, context, event, callback);
    } else if (context.DATA_SOURCE === 'webhook') {
      webhookOptIn(null, false, context, event, callback);
    } else {
      console.log('No data source set.');
      return callback(null, null);
    }
  } else {
    // Your application code goes here!
    return callback(null, null);
  }
};
