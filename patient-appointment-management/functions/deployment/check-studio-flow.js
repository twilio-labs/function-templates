/* eslint-disable camelcase, dot-notation, consistent-return, callback-return */
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
const assert = require('assert');

const path0 = Runtime.getFunctions()['helpers'].path;
const { getParam, setParam } = require(path0);
const path1 = Runtime.getFunctions()['auth'].path;
const { isValidAppToken } = require(path1);

exports.handler = async function (context, event, callback) {
  console.log(THIS, 'Begin');
  console.time(THIS);
  try {
    assert(event.token, 'missing event.token');
    if (!isValidAppToken(event.token, context)) {
      const response = new Twilio.Response();
      response.setStatusCode(401);
      response.appendHeader('Content-Type', 'application/json');
      response.setBody({ message: 'Unauthorized' });

      return callback(null, response);
    }

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
          }
        });
        callback(null, 'NOT-DEPLOYED');
      })
      .catch((err) => callback(err));
  } finally {
    console.timeEnd(THIS);
  }
};
