const THIS = 'deployment/deploy-studio-flow:';
// --------------------------------------------------------------------------------
// function description
//
// event:
// .
// --------------------------------------------------------------------------------
const assert = require('assert');
const fs     = require('fs');
const path   = Runtime.getFunctions()['helpers'].path;
const { retrieveParameter, assignParameter} = require(path);

exports.handler = async function (context, event, callback) {
  console.log(THIS, 'Starting');
  console.time(THIS);
  try {

  // ---------- parameters
  const CUSTOMER_NAME             = await retrieveParameter(context, 'CUSTOMER_NAME');
  const CUSTOMER_EHR_ENDPOINT_URL = await retrieveParameter(context, 'CUSTOMER_EHR_ENDPOINT_URL');
  const APPLICATION_NAME          = await retrieveParameter(context, 'APPLICATION_NAME');
  const TWILIO_PHONE_NUMBER       = await retrieveParameter(context, 'TWILIO_PHONE_NUMBER');
  const SERVICE_SID               = await retrieveParameter(context, 'SERVICE_SID');
  const ENVIRONMENT_SID           = await retrieveParameter(context, 'ENVIRONMENT_SID');
  const ENVIRONMENT_DOMAIN_NAME   = await retrieveParameter(context, 'ENVIRONMENT_DOMAIN_NAME');
  const FLOW_SID                  = await retrieveParameter(context, 'FLOW_SID');

  // ---------- load & configure studio flow definition
  console.log(THIS, 'Replacing YOUR_HEALTH_SYSTEM_NAME      ->', CUSTOMER_NAME);
  console.log(THIS, 'Replacing YOUR_EHR_ENDPOINT_URL        ->', CUSTOMER_EHR_ENDPOINT_URL);
  console.log(THIS, 'Replacing YOUR_SERVICE_SID             ->', SERVICE_SID);
  console.log(THIS, 'Replacing YOUR_ENVIRONMENT_SID         ->', ENVIRONMENT_SID);
  console.log(THIS, 'Replacing YOUR_ENVIRONMENT_DOMAIN_NAME ->', ENVIRONMENT_DOMAIN_NAME);
  const flow_definition_file = Runtime.getAssets()['/studio-flow-template.json'].path;
  let flow_definition =  fs.readFileSync(flow_definition_file).toString('utf-8')
    .replace('YOUR_HEALTH_SYSTEM_NAME', CUSTOMER_NAME)
    .replace('YOUR_EHR_ENDPOINT_URL'  , CUSTOMER_EHR_ENDPOINT_URL)
    .replaceAll('YOUR_SERVICE_SID', SERVICE_SID)
    .replaceAll('YOUR_ENVIRONMENT_SID', ENVIRONMENT_SID)
    .replaceAll('YOUR_ENVIRONMENT_DOMAIN_NAME', ENVIRONMENT_DOMAIN_NAME);

  const client = context.getTwilioClient();
  let functions = await client.serverless
    .services(SERVICE_SID)
    .functions.list();
  functions.forEach(function(f) {
    const fname = 'YOUR_FUNCTION_SID[' + f.friendlyName.replace('/', '') + ']';
    console.log(THIS, 'Replacing function', fname, '->', f.sid);
    flow_definition = flow_definition.replace(fname, f.sid);
  });

  // ---------- update/create/delete studio flow
  let action = null;
  if (event.hasOwnProperty('action') && event.action === 'DELETE') {
    action = 'DELETE';
  } else if (FLOW_SID != null && FLOW_SID.startsWith('FW')) {
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
      client.incomingPhoneNumbers(numberSid)
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
      console.log(THIS, 'Updating flow FLOW_SID=', FLOW_SID);
      flow = await client.studio
        .flows(FLOW_SID)
        .update({
          friendlyName: APPLICATION_NAME,
          status: 'published',
          commitMessage: 'Manually triggered update',
          definition: `${flow_definition}`
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
      flow = await client.studio
        .flows
        .create({
          friendlyName: APPLICATION_NAME,
          status: 'published',
          commitMessage: 'Code Exchange automatic deploy',
          definition: `${flow_definition}`
        });
      assignParameter(context, 'FLOW_SID', flow.sid);

      console.log(THIS, 'TWILIO_PHONE_NUMBER=', TWILIO_PHONE_NUMBER);
      const phoneNumberSid = await getPhoneNumberSid(TWILIO_PHONE_NUMBER);
      console.log(THIS, 'TWILIO_PHONE_NUMBER_SID=', phoneNumberSid);
      await updatePhoneNumberWebhook(flow.webhookUrl, phoneNumberSid);
      console.log(THIS, 'TWILIO_PHONE_NUMBER assigned to flow');
    }
    break;

    case 'DELETE':
    {
      console.log(THIS, 'Deleting FLOW_SID=', FLOW_SID);
      await client.studio.flows(FLOW_SID).remove();
    }
    break;

    default:
      callback('undefined action!');

  }

  callback(null, 'success');

  } catch (err) {
      throw new Error(err.details);
  } finally {
    console.timeEnd(THIS);
  }
};