exports.handler = function(context, event, callback) {
  
  const stopKeywords = ['cancel', 'end', 'quit', 'stop', 'stopall', 'unsubscribe'];
  const startKeywords = ['start', 'unstop', 'yes'];
  
  // Lowercase everything so that we're case insensitive
  const message = event.Body.toLowerCase();
  const optInKeyword = context.OPT_IN_KEYWORD.toLowerCase();
  const Airtable = require('airtable');
  const base = new Airtable({apiKey: context.AIRTABLE_API_KEY}).base(context.AIRTABLE_BASE_ID);

  if (message === optInKeyword || startKeywords.includes(message)) {
    var twiml = new Twilio.twiml.MessagingResponse()
    twiml.message(context.SUBSCRIBE_CONFIRMATION);

    base('Campaign Contacts').select({
      maxRecords: 1,
      filterByFormula: `{Phone} = '${event.From}'`,
      view: "Grid view"
    }).eachPage((records, fetchNextPage) => {
      if (records.length > 0) {
        records.forEach((record) => {
          base('Campaign Contacts').update([
            {
              "id": record.getId(),
              "fields": {
                "Opt In": true
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
        base('Campaign Contacts').create([
          {
            "fields": {
              "Phone": event.From,
              "Opt In": true
            }
          }
        ], (err, records) => {
          if (err) { callback(err); }

          callback(null, twiml)
        });
      }
    })


    // Handle opt-ins
  } else if (stopKeywords.includes(message)) {

    // Handle opt-outs
    base('Campaign Contacts').select({
      maxRecords: 1,
      filterByFormula: `{Phone} = '${event.From}'`,
      view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
      console.log('stopword', records)
      records.forEach((record) => {
        base('Campaign Contacts').update([
          {
            "id": record.getId(),
            "fields": {
              "Opt In": false
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
  } else {
    // Your application code goes here!
    callback(null, null);
  }
};