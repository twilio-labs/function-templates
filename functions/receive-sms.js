exports.handler = function(context, event, callback) {
  
  const stopKeywords = ['cancel', 'end', 'quit', 'stop', 'stopall', 'unsubscribe'];
  const startKeywords = ['start', 'unstop', 'yes'];
  
  // Lowercase everything so that we're case insensitive
  const message = event.Body.toLowerCase();
  const optInKeyword = context.OPT_IN_KEYWORD.toLowerCase();

  const axios = require('axios');

  if(context.DATA_SOURCE === 'airtable') {
    const Airtable = require('airtable');
    const base = new Airtable({apiKey: context.AIRTABLE_API_KEY}).base(context.AIRTABLE_BASE_ID);
    const tableName = context.AIRTABLE_TABLE_NAME;
    const phoneColumnName = context.AIRTABLE_PHONE_COLUMN_NAME;
    const optInColumnName = context.AIRTABLE_OPT_IN_COLUMN_NAME;
  }

  function webhookOptIn(twiml, optin) {
    console.log('webhook!')
    axios({
      method: 'post',
      url: context.WEBHOOK_URL,
      data: {
        phoneNumber: event.From,
        optInStatus: optin ? 'active' : 'inactive'
      }
    })
    .then(result => {
      callback(null, twiml);
    })
    .catch(err => {
      callback(err);
    });
  }

  function segmentOptIn(twiml, optin) {

    const Analytics = require('analytics').default;
    const segmentPlugin = require('@analytics/segment');

    const analytics = Analytics({
      app: 'twilio-keyword',
      plugins: [
        segmentPlugin({
          writeKey: context.SEGMENT_WRITE_KEY
        })
      ]
    });

    if (optin) {
      analytics.track("SMS Opt In", {
        phone: event.From,
        opt_in_status: "active"
      });

      callback(null, twiml);
    } else {
      analytics.track("SMS Opt Out", {
        phone: event.From,
        opt_in_status: "inactive"
      });
    }
  }

  function airtableCreateOptIn(twiml) {
    base(tableName).select({
      maxRecords: 1,
      filterByFormula: `{Phone} = '${event.From}'`,
      view: "Grid view"
    }).eachPage((records, fetchNextPage) => {
      if (records.length > 0) {
        records.forEach((record) => {
          base(tableName).update([
            {
              "id": record.getId(),
              "fields": {
                [optInColumnName]: true
              }
            }
          ], (err, records) => {
            if (err) {
              console.error(err);
              return;
            }
            callback(null, twiml);
          });
        });
      } else {
        base(tableName).create([
          {
            "fields": {
              [phoneColumnName]: event.From,
              [optInColumnName]: true
            }
          }
        ], (err, records) => {
          if (err) { callback(err); }

          callback(null, twiml)
        });
      }
    });
  };

  function airtableRemoveOptIn() {
    base(tableName).select({
      maxRecords: 1,
      filterByFormula: `{Phone} = '${event.From}'`,
      view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
      console.log('stopword', records)
      records.forEach((record) => {
        base(tableName).update([
          {
            "id": record.getId(),
            "fields": {
              [optInColumnName]: false
            }
          }
        ], (err, records) => {
          if (err) {
            console.error(err);
            return;
          }
          callback(null, null);
        });
      });
    }, function done(err) {
        if (err) {
          console.error(err);
          callback(err);
        }
    });
  }

  if (message === optInKeyword || startKeywords.includes(message)) {
    var twiml = new Twilio.twiml.MessagingResponse()
    twiml.message(context.SUBSCRIBE_CONFIRMATION);

    if(context.DATA_SOURCE === "airtable") {
      airtableCreateOptIn(twiml);
    } else if (context.DATA_SOURCE === "segment") {
      segmentOptIn(twiml, true);
    } else if (context.DATA_SOURCE === "webhook") {
      webhookOptIn(twiml, true)
    }

  } else if (stopKeywords.includes(message)) {

    if(context.DATA_SOURCE === "airtable") {
      airtableRemoveOptIn();
    } else if (context.DATA_SOURCE === "segment") {
      segmentOptIn(null, false);
    } else if (context.DATA_SOURCE === "webhook") {
      webhookOptIn(null, false)
    }
    
  } else {
    // Your application code goes here!
    callback(null, null);
  }
};