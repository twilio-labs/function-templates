/* eslint-disable camelcase */
/* eslint-disable consistent-return */
const THIS = 'deployment/check-studio-flow:';
/*
 * --------------------------------------------------------------------------------
 * function description
 *
 * event:
 * . action = DELETE, optional
 * --------------------------------------------------------------------------------
 */
const { path } = Runtime.getFunctions().helpers;
const { retrieveParameter, assignParameter } = require(path);

exports.handler = async function (context, event, callback) {
  console.log(THIS, 'Begin');
  console.time(THIS);
  try {
    // TWILIO_FLOW_SID will be 'null' if associated flow is not found
    const TWILIO_FLOW_SID = await retrieveParameter(context, 'TWILIO_FLOW_SID');

    const client = context.getTwilioClient();
    const is_flow_deployed = client.studio.flows
      .list({ limit: 100 })
      .then((flows) => {
        if (flows.length === 0) return false;
        flows.forEach((f) => {
          if (f.sid === TWILIO_FLOW_SID) {
            console.log(THIS, 'Found', TWILIO_FLOW_SID);
            return true;
          }
        });
        return false;
      })
      .catch((err) => throw err);

    if (is_flow_deployed) return callback(null, TWILIO_FLOW_SID);
    return callback(null, 'NOT-DEPLOYED');
  } catch (err) {
    console.log(err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
};
