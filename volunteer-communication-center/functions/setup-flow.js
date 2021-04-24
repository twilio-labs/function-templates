/* eslint-disable no-console, func-names */
exports.handler = async function (context, event, callback) {

  const assets = Runtime.getAssets();
  const flowDefinition = require(assets["/studio_flow.js"].path);
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
      .then(workspaces => {
        for (let i=0; i < workspaces.length; i++) {
          if (workspaces[i].hasOwnProperty("friendlyName") && workspaces[i]["friendlyName"] == "Flex Task Assignment") {
            return workspaces[i];
          }
        }
        return null;
      })
      .catch((err) => { throw new Error(err.details) });
  }


  function fetchWorkFlow(ws) {
    return client.taskrouter.workspaces(ws)
      .workflows
      .list({limit: 20})
      .then(workflows => {
        for (let i=0; i < workflows.length; i++) {
          if (workflows[i].hasOwnProperty("friendlyName") && workflows[i]["friendlyName"] == "Assign to Anyone") {
            return workflows[i];
          }
        }
        return null;
      });
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

          if (states[i].hasOwnProperty("name") && states[i]["name"] == "send_to_flex_sms") {
            states[i]["properties"]["channel"] = smsChannel.sid;
          } else if (states[i].hasOwnProperty("name") && states[i]["name"] == "send_to_flex_voice") {
            states[i]["properties"]["channel"] = voiceChannel.sid;
          }
        }
      }
      flowDefinition["states"] = states;

    }
  }



  function configureFlowWithAssistant() {
    if (process.env.AUTOPILOT_SID) {
      const states = flowDefinition["states"];

      for (let i = 0; i < states.length; i++) {
        if (states[i]["properties"].hasOwnProperty("autopilot_assistant_sid")) {
          
          states[i]["properties"]["autopilot_assistant_sid"] = process.env.AUTOPILOT_SID;
          break;
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