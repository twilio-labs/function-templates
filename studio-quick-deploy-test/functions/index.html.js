/* eslint-disable no-console, func-names */
exports.handler = async function (context, event, callback) {
  const assets = Runtime.getAssets();
  const flowDefinition = require(assets['/studio_flow.js'].path);
  const { path } = Runtime.getFunctions().auth;
  const {
    getCurrentEnvironment,
    getEnvironmentVariable,
    setEnvironmentVariable,
  } = require(path);

  const client = context.getTwilioClient();

  function getStudioRedirectUrl(flowSid) {
    return `https://console.twilio.com?frameUrl=%2Fconsole%2Fstudio%2Fflows%2F${flowSid}`;
  }

  // TODO: Move to it's own function which can be kicked off async?
  function cleanupService() {
    console.log(`Deleting ${context.SERVICE_SID}`);
    return client.serverless.v1
      .services('TEST_SERVICE_SID')
      .remove() // Use context.SERVICE_SID in real environment. Just testing that it works here
      .then((res) => console.log(res))
      .catch((err) => {
        console.error(err);
        console.error(err.details);
        throw new Error(err.details);
      });
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
    return setEnvironmentVariable(context, environment, 'FLOW_SID', sid);
  }

  const environment = await getCurrentEnvironment(context);

  // Create redirect response to Studio
  const response = new Twilio.Response();
  response.setStatusCode(308); // Perm redirect

  // IF FLOW_SID ALREADY EXISTS THE FLOW HAS BEEN CREATED. SHOT CIRCUIT, PREVENTING MULTIPLE FLOWS
  const flowSid = await getEnvironmentVariable(
    context,
    environment,
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
  if (environment) {
    await setFlowSidEnvVar(environment, flow.sid);
  } else {
    process.env.FLOW_SID = flow.sid;
  }
  const phoneNumberSid = await getPhoneNumberSid();
  await updatePhoneNumberWebhook(flow.webhookUrl, phoneNumberSid);

  // Async trigger deletion of service??
  cleanupService();

  response.appendHeader('Location', getStudioRedirectUrl(flow.sid));
  callback(null, response);
};
