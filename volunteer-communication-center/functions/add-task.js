/* eslint-disable no-console, func-names */
exports.handler = async function (context, event, callback) {

  const client = context.getTwilioClient();


  function createTask(assistant, task) {
    return client.autopilot.assistants(assistant)
        .tasks
        .create({
          actions: task["actions"],
         uniqueName: task["uniqueName"]
        })
        .then(task => task)
        .catch((err) => { throw new Error(err.details) });
  }

  function createSample(assistant, task, sample) {
    return client.autopilot.assistants(assistant)
                .tasks(task.sid)
                .samples
                .create(sample)
                .then(sample => sample)
                .catch((err) => { throw new Error(err.details) });

  }

  async function configureSamples(assistant, task, taskData) {

      for (let i = 0; i < taskData["samples"].length; i++) {
        await createSample(assistant, task, taskData["samples"][i]);
      }
  }


  const assistantSID = event.sid;
  const taskData = event.task;

  const task = await createTask(assistantSID, taskData);
  await configureSamples(assistantSID, task, taskData);


  callback(null, 'success');
};