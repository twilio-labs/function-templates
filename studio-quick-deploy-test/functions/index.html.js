const helpers = require('@twilio-labs/runtime-helpers');
const axios = require('axios');

/* eslint-disable no-console, func-names */
exports.handler = async function (context, event, callback) {
  const assets = Runtime.getAssets();
  const flowDefinition = require(assets['/studio_flow.js'].path);

  const client = context.getTwilioClient();
  const currentEnvironment = await helpers.environment.getCurrentEnvironment(
    context
  );

  function getStudioRedirectUrl(flowSid) {
    return `https://console.twilio.com?frameUrl=%2Fconsole%2Fstudio%2Fflows%2F${flowSid}`;
  }

  // TODO: Move to it's own function which can be kicked off async?
  async function cleanupService() {
    console.log(`Deleting - https://${context.DOMAIN_NAME}/delete`);
    const result = await axios.get(`https://${context.DOMAIN_NAME}/delete`);

    return result;
  }

  // Deploy Twilio Studio Flow
  function deployStudio() {
    return client.studio.v2.flows
      .create({
        commitMessage: 'Code Exchange automatic deploy',
        friendlyName: 'Quick Deploy Test',
        status: 'published',
        definition: flowDefinition,
      })
      .then((flow) => flow)
      .catch((err) => {
        console.error(err);
        console.error(err.details);
        throw new Error(err.details);
      });
  }

  function getPhoneNumberSid() {
    return new Promise((resolve, reject) => {
      client.incomingPhoneNumbers
        .list({ phoneNumber: context.TWILIO_PHONE_NUMBER, limit: 20 })
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

  function setFlowSidEnvVar(environment, sid) {
    return helpers.environment.setEnvironmentVariable(
      context,
      environment,
      'FLOW_SID',
      sid
    );
  }

  // Create redirect response to Studio
  const response = new Twilio.Response();
  response.setStatusCode(308); // Perm redirect

  // IF FLOW_SID ALREADY EXISTS THE FLOW HAS BEEN CREATED. SHOT CIRCUIT, PREVENTING MULTIPLE FLOWS
  const flowSid = await helpers.environment.getEnvironmentVariable(
    context,
    currentEnvironment,
    'FLOW_SID'
  );
  if (flowSid) {
    console.log('FLOW ALREADY CREATED');
    response.appendHeader('Location', getStudioRedirectUrl(flowSid));
    await cleanupService();

    return callback(null, response);
  }

  console.log('CREATING NEW FLOW');
  const flow = await deployStudio();

  // No environment exists when developing locally
  if (currentEnvironment) {
    await setFlowSidEnvVar(currentEnvironment, flow.sid);
  } else {
    process.env.FLOW_SID = flow.sid;
  }

  const phoneNumberSid = await getPhoneNumberSid();
  await updatePhoneNumberWebhook(flow.webhookUrl, phoneNumberSid);

  response.appendHeader('Location', getStudioRedirectUrl(flow.sid));
  await cleanupService();
  return callback(null, response);
};
