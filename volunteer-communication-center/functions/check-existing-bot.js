exports.handler = async function(context, event, callback) {

  const client = context.getTwilioClient();
  const autopilotSid = context.AUTOPILOT_SID;


  client.autopilot.assistants.list({limit: 20})
      .then(assistants => {
          if (assistants.length > 0) {
              assistants.forEach(f => {
                  // Note: If you are running this app locally and you kill your dev server after creating
                  // the Studio Flow via the app, you will need to manually set FLOW_SID in your .env file
                  // before the next time you start your dev server.
                  if (f.sid === autopilotSid) {
                      callback(null, f.sid)
                      return;
                  }
                  callback(null, 'none')
              });
          } else {
              callback(null, 'none');
          }
      })
      .catch(err => callback(err));

};