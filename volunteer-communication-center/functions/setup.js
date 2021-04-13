/* eslint-disable no-console, func-names */
exports.handler = async function (context, event, callback) {

  const assets = Runtime.getAssets();
  const flowDefinition = require(assets["/studio_flow.js"].path);
  const autopilotDefinition = require(assets["/autopilot_bot.js"].path);
  const path = Runtime.getFunctions()['auth'].path;
  const { getCurrentEnvironment, setEnvironmentVariable } = require(path);

  const client = context.getTwilioClient();

  // Deploy Twilio Studio Flow
  function deployStudio() {
    return client.studio.flows
        .create({
          commitMessage: 'Code Exchange automatic deploy',
          friendlyName: 'Volunteer Communication Center',
          status: 'published',
          definition: flowDefinition,
        })
        .then((flow) => flow)
        .catch((err) => { throw new Error(err.details) });
  }

  function deployAutopilot() {
    return client.autopilot.assistants
                .create({
                   friendlyName: 'Styled Assistant',
                   uniqueName: 'stsyled-assigstant',
                   styleSheet: autopilotDefinition
                 })
                .then((assistant) => assistant)
                .catch((err) => { throw new Error(err.details) }
                );

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

  function setFlowSidEnvVar(environment, sid) {
    return setEnvironmentVariable(
      context,
      environment,
      'FLOW_SID',
      sid
    );
  }

  const flow = await deployStudio(flowDefinition);
  const assistant = await deployAutopilot(autopilotDefinition);
  const environment = await getCurrentEnvironment(context);
  // No environment exists when developing locally
  if(environment) {
    await setFlowSidEnvVar(environment, flow.sid);
    await setAutopilotSidEnvVar(environment, assistant.sid);
  } else {
    process.env.FLOW_SID = flow.sid;
    process.env.AUTOPILOT_SID = assistant.sid;
  }
  const phoneNumberSid = await getPhoneNumberSid();
  await updatePhoneNumberWebhook(flow.webhookUrl, phoneNumberSid);

  callback(null, 'success');
};