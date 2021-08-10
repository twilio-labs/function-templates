/* eslint-disable camelcase, dot-notation */
const THIS = 'deployment/deploy-studio-flow:';
/*
 * --------------------------------------------------------------------------------
 * function description
 *
 * event:
 * .
 * --------------------------------------------------------------------------------
 */
const assert = require('assert');
const fs = require('fs');

const path0 = Runtime.getFunctions()['helpers'].path;
const { getParam, setParam } = require(path0);
const path1 = Runtime.getFunctions()['auth'].path;
const { isValidAppToken } = require(path1);

exports.handler = async function (context, event, callback) {
  console.log(THIS, 'Starting');
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

    // ---------- parameters
    const CUSTOMER_NAME = await getParam(context, 'CUSTOMER_NAME');
    const APPLICATION_NAME = await getParam(context, 'APPLICATION_NAME');
    const TWILIO_PHONE_NUMBER = await getParam(context, 'TWILIO_PHONE_NUMBER');
    const TWILIO_SERVICE_SID = await getParam(context, 'TWILIO_SERVICE_SID');
    const TWILIO_ENVIRONMENT_SID = await getParam(
      context,
      'TWILIO_ENVIRONMENT_SID'
    );
    const TWILIO_ENVIRONMENT_DOMAIN_NAME = await getParam(
      context,
      'TWILIO_ENVIRONMENT_DOMAIN_NAME'
    );
    const TWILIO_FLOW_SID = await getParam(context, 'TWILIO_FLOW_SID');

    // ---------- load & configure studio flow definition
    console.log(
      THIS,
      'Replacing YOUR_HEALTH_SYSTEM_NAME      ->',
      CUSTOMER_NAME
    );
    console.log(
      THIS,
      'Replacing YOUR_TWILIO_SERVICE_SID             ->',
      TWILIO_SERVICE_SID
    );
    console.log(
      THIS,
      'Replacing YOUR_TWILIO_ENVIRONMENT_SID         ->',
      TWILIO_ENVIRONMENT_SID
    );
    console.log(
      THIS,
      'Replacing YOUR_TWILIO_ENVIRONMENT_DOMAIN_NAME ->',
      TWILIO_ENVIRONMENT_DOMAIN_NAME
    );
    const flow_definition_file =
      Runtime.getAssets()['/studio-flow-template.json'].path;
    let flow_definition = fs
      .readFileSync(flow_definition_file)
      .toString('utf-8')
      .replace('YOUR_HEALTH_SYSTEM_NAME', CUSTOMER_NAME)
      .replace(/YOUR_TWILIO_SERVICE_SID/g, TWILIO_SERVICE_SID)
      .replace(/YOUR_TWILIO_ENVIRONMENT_SID/g, TWILIO_ENVIRONMENT_SID)
      .replace(
        /YOUR_TWILIO_ENVIRONMENT_DOMAIN_NAME/g,
        TWILIO_ENVIRONMENT_DOMAIN_NAME
      );

    const client = context.getTwilioClient();
    const functions = await client.serverless
      .services(TWILIO_SERVICE_SID)
      .functions.list();
    functions.forEach(function (f) {
      const fname = `YOUR_FUNCTION_SID[${f.friendlyName.replace('/', '')}]`;
      console.log(THIS, 'Replacing function', fname, '->', f.sid);
      flow_definition = flow_definition.replace(fname, f.sid);
    });

    // ---------- update/create/delete studio flow
    let action = null;
    if (event.hasOwnProperty('action') && event.action === 'DELETE') {
      action = 'DELETE';
    } else if (TWILIO_FLOW_SID !== null && TWILIO_FLOW_SID.startsWith('FW')) {
      action = 'UPDATE';
    } else {
      action = 'CREATE';
    }

    function getPhoneNumberSid(phone_number) {
      return new Promise((resolve, reject) => {
        client.incomingPhoneNumbers
          .list({ phoneNumber: phone_number, limit: 20 })
          .then((incomingPhoneNumbers) => {
            const n = incomingPhoneNumbers[0];
            resolve(n.sid);
          })
          .catch((err) => reject(err));
      });
    }

    function updatePhoneNumberWebhook(studioWebhook, numberSid) {
      return new Promise((resolve, reject) => {
        client
          .incomingPhoneNumbers(numberSid)
          .update({
            smsUrl: studioWebhook,
          })
          .then(() => {
            resolve('success');
          })
          .catch((err) => reject(err));
      });
    }

    let flow = null;

    switch (action) {
      case 'UPDATE':
        {
          console.log(THIS, 'Updating flow TWILIO_FLOW_SID=', TWILIO_FLOW_SID);
          flow = await client.studio.flows(TWILIO_FLOW_SID).update({
            friendlyName: APPLICATION_NAME,
            status: 'published',
            commitMessage: 'Manually triggered update',
            definition: `${flow_definition}`,
          });

          console.log(THIS, 'TWILIO_PHONE_NUMBER=', TWILIO_PHONE_NUMBER);
          const phoneNumberSid = await getPhoneNumberSid(TWILIO_PHONE_NUMBER);
          console.log(THIS, 'TWILIO_PHONE_NUMBER_SID=', phoneNumberSid);
          await updatePhoneNumberWebhook(flow.webhookUrl, phoneNumberSid);
          console.log(THIS, 'TWILIO_PHONE_NUMBER assigned to flow');
        }
        break;

      case 'CREATE':
        {
          console.log(THIS, 'Creating flow');
          flow = await client.studio.flows.create({
            friendlyName: APPLICATION_NAME,
            status: 'published',
            commitMessage: 'Code Exchange automatic deploy',
            definition: `${flow_definition}`,
          });
          setParam(context, 'TWILIO_FLOW_SID', flow.sid);

          console.log(THIS, 'TWILIO_PHONE_NUMBER=', TWILIO_PHONE_NUMBER);
          const phoneNumberSid = await getPhoneNumberSid(TWILIO_PHONE_NUMBER);
          console.log(THIS, 'TWILIO_PHONE_NUMBER_SID=', phoneNumberSid);
          await updatePhoneNumberWebhook(flow.webhookUrl, phoneNumberSid);
          console.log(THIS, 'TWILIO_PHONE_NUMBER assigned to flow');
        }
        break;

      case 'DELETE':
        console.log(THIS, 'Deleting TWILIO_FLOW_SID=', TWILIO_FLOW_SID);
        await client.studio.flows(TWILIO_FLOW_SID).remove();
        break;

      default:
        return callback('undefined action!');
        break;
    }

    return callback(null, `${action} success`);
  } catch (err) {
    console.log(err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
};
