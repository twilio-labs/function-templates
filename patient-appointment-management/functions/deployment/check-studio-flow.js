/* eslint-disable camelcase */
/* eslint-disable callback-return */
const THIS = 'deployment/check-studio-flow:';
/*
 * --------------------------------------------------------------------------------
 * function description
 *
 * event:
 * . action = DELETE, optional
 *
 * returns:
 * - NOT-DEPLOYED, if not deployed
 * --------------------------------------------------------------------------------
 */
const { path } = Runtime.getFunctions().helpers;
const { getParam, setParam } = require(path);

exports.handler = async function (context, event, callback) {
  console.log(THIS, 'Begin');
  console.time(THIS);
  try {
    // TWILIO_FLOW_SID will be 'null' if associated flow is not found
    const TWILIO_FLOW_SID = await getParam(context, 'TWILIO_FLOW_SID');

    const client = context.getTwilioClient();
    client.studio.flows
      .list({ limit: 100 })
      .then((flows) => {
        if (flows.length === 0) callback(null, 'NOT-DEPLOYED');
        flows.forEach((f) => {
          if (f.sid === TWILIO_FLOW_SID) {
            console.log(THIS, 'Found', TWILIO_FLOW_SID);
            callback(null, TWILIO_FLOW_SID);
            return;
          }
        });
        callback(null, 'NOT-DEPLOYED');
      })
      .catch((err) => callback(err));
  } finally {
    console.timeEnd(THIS);
  }
};
