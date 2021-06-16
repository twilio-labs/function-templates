/* eslint-disable no-console, func-names */
exports.handler = async function (context, event, callback) {

  const assets = Runtime.getAssets();
  const flowDefinition = require(assets["/studio_flow.js"].path);
  const path = Runtime.getFunctions().auth.path;
  const { getCurrentEnvironment, setEnvironmentVariable } = require(path);

  const client = context.getTwilioClient();

  // Configure Studio Flow with Function
  async function configureFlowWithFunction() {
    
    const functionName = 'es-dialogflow-detect-intent';
    const environment = await getCurrentEnvironment(context);
    const domainName = environment.domainName;
    const functionURL = `https://${domainName}/${functionName}`;
  
    const studioWidgets = flowDefinition.states;
    const functionWidget = studioWidgets.find(widget => widget.name === "DialogflowDetectIntent");
    functionWidget.properties.url = functionURL;
    flowDefinition.states = studioWidgets;    
  
 }
 
  // Deploy Twilio Studio Flow
function deployStudio() {  
    
  return configureFlowWithFunction()
    .then(()=>{
      return client.studio.flows
        .create({
          commitMessage: 'Code Exchange automatic deploy',
          friendlyName: 'Vaccine FAQ Bot',
          status: 'published',
          definition: flowDefinition,
        })
        .then((flow) => flow)
        .catch((err) => { throw new Error(err.details) });
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

  
  const flow = await deployStudio();
  const environment = await getCurrentEnvironment(context);
  // No environment exists when developing locally
  if(environment) {
    await setFlowSidEnvVar(environment, flow.sid);
  } else {
    process.env.FLOW_SID = flow.sid;
  }
  const phoneNumberSid = await getPhoneNumberSid();
  await updatePhoneNumberWebhook(flow.webhookUrl, phoneNumberSid);

  callback(null, 'success');
};
