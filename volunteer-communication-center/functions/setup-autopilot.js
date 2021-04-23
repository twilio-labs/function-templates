/* eslint-disable no-console, func-names */
exports.handler = async function (context, event, callback) {

  const assets = Runtime.getAssets();
  const autopilotDefinition = require(assets["/autopilot_bot.js"].path);
  const path = Runtime.getFunctions()['auth'].path;
  const { getCurrentEnvironment, setEnvironmentVariable } = require(path);

  const client = context.getTwilioClient();


  function createAssistant() {
    return client.autopilot.assistants
    .create({
       friendlyName: autopilotDefinition["friendlyName"],
       uniqueName: autopilotDefinition["uniqueName"],
       styleSheet: autopilotDefinition["styleSheet"]
     })
    .then(assistant => assistant)
    .catch((err) => { throw new Error(err.details) });
  }

  function createTask(assistant, task) {
    return client.autopilot.assistants(assistant.sid)
        .tasks
        .create({
          actions: task["actions"],
         uniqueName: task["uniqueName"]
        })
        .then(task => task)
        .catch((err) => { throw new Error(err.details) });
  }

  function createSample(assistant, task, sample) {
    return client.autopilot.assistants(assistant.sid)
                .tasks(task.sid)
                .samples
                .create(sample)
                .then(sample => sample)
                .catch((err) => { throw new Error(err.details) });

  }

  function modelBuild(assistant) {
    return client.autopilot.assistants(assistant.sid)
            .modelBuilds
            .create()
            .then(model_build => model_build.sid)
            .catch((err) => { throw new Error(err.details) });
  }


  async function deployAutopilot() {
    const assistant = await createAssistant();
    
    const tasks = autopilotDefinition["tasks"];

    for (let i = 0; i < tasks.length; i++) {
      const taskData = tasks[i];
      const task = await createTask(assistant, taskData);

      for (let j = 0; j < taskData["samples"].length; j++) {
        await createSample(assistant, task, taskData["samples"][j]);
      }
    }

    await modelBuild(assistant);

    return assistant;

  }

  function setAutopilotSidEnvVar(environment, sid) {
    return setEnvironmentVariable(
      context,
      environment,
      'AUTOPILOT_SID',
      sid
    );
  }

  const assistant = await deployAutopilot();
  const environment = await getCurrentEnvironment(context);
  // No environment exists when developing locally
  if(environment) {
    await setAutopilotSidEnvVar(environment, assistant.sid);
  } else {
    process.env.AUTOPILOT_SID = assistant.sid;
  }

  callback(null, 'success');
};