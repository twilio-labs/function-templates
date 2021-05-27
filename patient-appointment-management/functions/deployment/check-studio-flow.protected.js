const THIS = 'deployment/check-studio-flow:';
// --------------------------------------------------------------------------------
// function description
//
// event:
// . action = DELETE, optional
// --------------------------------------------------------------------------------
const path   = Runtime.getFunctions()['helpers'].path;
const { retrieveParameter, assignParameter } = require(path);

exports.handler = async function(context, event, callback) {
  console.log(THIS, 'Starting');
  console.time(THIS);
  try {

  // FLOW_SID will be 'null' if associated flow is not found
  const FLOW_SID = await retrieveParameter(context, 'FLOW_SID');

  const client = context.getTwilioClient();
  client.studio.flows.list({limit: 100})
    .then(flows => {
      if (flows.length > 0) {
        flows.forEach(f => {
          // Note: If you are running this app locally and you kill your dev server after creating
          // the Studio Flow via the app, you will need to manually set FLOW_SID in your .env file
          // before the next time you start your dev server.
          if (f.sid === FLOW_SID) {
            console.log(THIS, 'Found', FLOW_SID);
            callback(null, FLOW_SID)
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
