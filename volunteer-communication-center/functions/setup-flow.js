/* eslint-disable no-console, func-names */
exports.handler = async function (context, event, callback) {

  const assets = Runtime.getAssets();
  const flowDefinition = require(assets["/studio-flow.js"].path);
  const path = Runtime.getFunctions()['auth'].path;
  const { getCurrentEnvironment, setEnvironmentVariable } = require(path);

  const client = context.getTwilioClient();

  // Deploy Twilio Studio Flow
  function deployStudio() {
    return configureFlowForFlex()
      .then(() => configureFlowWithAssistant())
      .then(() => {
        return client.studio.flows
        .create({
          commitMessage: 'Code Exchange automatic deploy',
          friendlyName: 'Volunteer Communication Center',
          status: 'published',
          definition: flowDefinition,
        })
        .then((flow) => flow)
        .catch((err) => { throw new Error(err.details) });
      });
  }


  function getWorkspace() {
    return client.taskrouter.workspaces
      .list({limit: 20})
      .then(workspaces => workspaces.find(workspace => workspace["friendlyName"] == "Flex Task Assignment"))
      .catch((err) => { throw new Error(err.details) });
  }


  function fetchWorkFlow(ws) {
    return client.taskrouter.workspaces(ws)
      .workflows
      .list({limit: 20})
      .then(workflows => workflows.find(workflow => workflow["friendlyName"] == "Assign to Anyone"))
      .catch((err) => { throw new Error(err.details) });
  }

  function getChannel(ws, type) {
    return client.taskrouter.workspaces(ws)
      .taskChannels
      .list({limit: 20})
      .then(taskChannels => taskChannels.find(channel => channel["uniqueName"] == type));
  }

  async function configureFlowForFlex() {

    const workspace = await getWorkspace();
    const workflow = await fetchWorkFlow(workspace.sid);
    const smsChannel = await getChannel(workspace.sid, "chat");
    const voiceChannel = await getChannel(workspace.sid, "voice");

    if (workspace && workflow) {
      const states = flowDefinition["states"];
      for (let i = 0; i < states.length; i++) {
        if (states[i]["properties"].hasOwnProperty("workflow")) {
          
          states[i]["properties"]["workflow"] = workflow.sid;

          if (states[i].hasOwnProperty("name") && states[i]["name"] == "FlexSMS") {
            states[i]["properties"]["channel"] = smsChannel.sid;
          } else if (states[i].hasOwnProperty("name") && states[i]["name"] == "FlexCall") {
            states[i]["properties"]["channel"] = voiceChannel.sid;
          }
        }
      }
      flowDefinition["states"] = states;

    }
  }



  function configureFlowWithAssistant() {
    if (context.AUTOPILOT_SID) {
      const states = flowDefinition["states"];

      for (let i = 0; i < states.length; i++) {
        if (states[i]["properties"].hasOwnProperty("autopilot_assistant_sid")) {
          
          states[i]["properties"]["autopilot_assistant_sid"] = context.AUTOPILOT_SID;
        }
      }
      flowDefinition["states"] = states;

    }
  }


  function getPhoneNumberSid() {
    return new Promise((resolve, reject) => {
      client.incomingPhoneNumbers
        .list({ phoneNumber: context.TWILIO_PHONE_NUMBER, limit: 20 })
        .then((incomingPhoneNumbers) => {
          if (incomingPhoneNumbers.length) {
            const n = incomingPhoneNumbers[0];
            resolve(n.sid);
          } else {
            throw new Error('Phone number does not exist on the account');
          }
        })
        .catch((err) => reject(err));
    });
  }

  function updatePhoneNumberWebhook(studioWebhook, numberSid) {
    return new Promise((resolve, reject) => {
      client.incomingPhoneNumbers(numberSid)
        .update({
          smsUrl: studioWebhook,
          voiceUrl: studioWebhook
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


  const environment = await getCurrentEnvironment(context);
  // No environment exists when developing locally
  if(environment) {
    await setFlowSidEnvVar(environment, flow.sid);
  } else {
    process.env.FLOW_SID = flow.sid;
  }
  try {
    const phoneNumberSid = await getPhoneNumberSid();
    await updatePhoneNumberWebhook(flow.webhookUrl, phoneNumberSid);
    callback(null, 'success');
  } catch(e) {
    callback(e);
  }

};
