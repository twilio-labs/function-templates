const THIS = 'deployment/check-studio-flow:';
// --------------------------------------------------------------------------------
// checks deployment status of studio flow
//
// returns:
// . NOT-DEPLOYED|FLOW_SID
// --------------------------------------------------------------------------------
const path   = Runtime.getFunctions()['helpers'].path;
const { retrieveParameter, assignParameter } = require(path);

exports.handler = async function(context, event, callback) {
  console.log(THIS, 'Begin');
  console.time(THIS);
  try {

  // TWILIO_FLOW_SID will be 'null' if associated flow is not found
  const TWILIO_FLOW_SID = await retrieveParameter(context, 'TWILIO_FLOW_SID');

  const client = context.getTwilioClient();
  client.studio.flows.list({limit: 100})
    .then(flows => {
      if (flows.length > 0) {
        flows.forEach(f => {
          // Note: If you are running this app locally and you kill your dev server after creating
          // the Studio Flow via the app, you will need to manually set TWILIO_FLOW_SID in your .env file
          // before the next time you start your dev server.
          if (f.sid === TWILIO_FLOW_SID) {
            console.log(THIS, 'Found', TWILIO_FLOW_SID);
            callback(null, TWILIO_FLOW_SID)
            return;
          }
          callback(null, 'NOT-DEPLOYED')
        });
      } else {
        callback(null, 'NOT-DEPLOYED');
      }
    })
    .catch(err => callback(err));

  } catch (err) {
    throw new Error(err.details);
  } finally {
    console.timeEnd(THIS);
  }
};
