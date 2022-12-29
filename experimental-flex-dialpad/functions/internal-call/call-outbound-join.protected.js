const fetchTask = (client, taskSid) =>
  client.taskrouter
    .workspaces(process.env.TWILIO_WORKSPACE_SID)
    .tasks(taskSid)
    .fetch();

const updateTaskAttributes = (client, taskSid, attributes) =>
  client.taskrouter
    .workspaces(process.env.TWILIO_WORKSPACE_SID)
    .tasks(taskSid)
    .update({
      attributes: JSON.stringify(attributes),
    });

const addParticipantToConference = (
  client,
  conferenceSid,
  taskSid,
  to,
  fromName
) => {
  if (to.substring(0, 6) === 'client') {
    return client.taskrouter
      .workspaces(process.env.TWILIO_WORKSPACE_SID)
      .tasks.create({
        attributes: JSON.stringify({
          to: to,
          name: fromName,
          from: process.env.TWILIO_PHONE_NUMBER,
          targetWorker: to,
          autoAnswer: 'false',
          conferenceSid: taskSid,
          conference: {
            sid: conferenceSid,
            friendlyName: taskSid,
          },
          internal: 'true',
          client_call: true,
        }),
        workflowSid: process.env.TWILIO_WORKFLOW_SID,
        taskChannel: 'voice',
      });
  }
};

exports.handler = async (context, event, callback) => {
  const client = context.getTwilioClient();
  const { FriendlyName: taskSid, ConferenceSid } = event;

  let attributes = {};

  if (event.StatusCallbackEvent === 'participant-join') {
    console.log(
      `callSid ${event.CallSid} joined, task is ${taskSid}, conference is ${event.ConferenceSid}`
    );

    const call = await client.calls(event.CallSid).fetch();

    if (call.to.includes('client')) {
      console.log(`agent ${call.to} joined the conference`);

      const task = await fetchTask(client, taskSid);

      attributes = {
        ...JSON.parse(task.attributes),
        conference: {
          sid: event.ConferenceSid,
          participants: {
            worker: event.CallSid,
          },
        },
      };

      if (
        attributes.worker_call_sid === attributes.conference.participants.worker
      ) {
        const { to, fromName } = attributes;

        const result = await addParticipantToConference(
          client,
          ConferenceSid,
          taskSid,
          to,
          fromName
        );

        attributes.conference.participants.taskSid = result.sid;

        await updateTaskAttributes(client, taskSid, attributes);
      }
    }
  }

  if (event.StatusCallbackEvent === 'conference-end') {
    try {
      const task = await fetchTask(client, taskSid);

      const attributes = JSON.parse(task.attributes);

      const targetTaskSid = attributes.conference.participants.taskSid;

      if (['assigned', 'pending', 'reserved'].includes(task.assignmentStatus)) {
        await client.taskrouter
          .workspaces(context.TWILIO_WORKSPACE_SID)
          .tasks(taskSid)
          .update({
            assignmentStatus:
              task.assignmentStatus === 'assigned' ? 'wrapping' : 'canceled',
            reason: 'conference is complete',
          });
      }

      if (targetTaskSid) {
        const { assignmentStatus } = await fetchTask(client, targetTaskSid);

        if (['assigned', 'pending', 'reserved'].includes(assignmentStatus)) {
          await client.taskrouter
            .workspaces(context.TWILIO_WORKSPACE_SID)
            .tasks(targetTaskSid)
            .update({
              assignmentStatus:
                assignmentStatus === 'assigned' ? 'wrapping' : 'canceled',
              reason: 'conference is complete',
            });
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  callback(null);
};
