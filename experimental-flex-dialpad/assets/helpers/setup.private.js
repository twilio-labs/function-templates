/**
 * This code is responsible of configuring other services required for the front-end or back-end of the template.
 */

const helpers = require('@twilio-labs/runtime-helpers');
// const twilio = require('twilio');
// const twilioClient = require('twilio')();

function isNotEmptyString(variable) {
  return (
    typeof variable === 'string' && variable.length > 0 && variable !== '""'
  );
}

async function getWorkspaceSid(twilioClient) {
  const workspaces = await twilioClient.taskrouter.workspaces.list();
  return workspaces.find((instance) => {
    return instance.friendlyName === 'Flex Task Assignment';
  });
}

exports.setupProject = async (context) => {
  const twilioClient = context.getTwilioClient();
  const currentEnvironment =
    await helpers.environment.getCurrentEnvironment(context);
  if (!currentEnvironment) {
    console.error('Could not find enviroment');
    return { setupDone: false };
  }

  const workspace = await getWorkspaceSid(twilioClient);
  if (!workspace) {
    console.error('Could not find Flex Task Router workspace');
    return { setupDone: false };
  }
  const TWILIO_WORKSPACE_SID = workspace.sid;
  await helpers.environment.setEnvironmentVariable(
    context,
    currentEnvironment,
    'TWILIO_WORKSPACE_SID',
    TWILIO_WORKSPACE_SID
  );

  const queue = (
    await twilioClient.taskrouter
      .workspaces(TWILIO_WORKSPACE_SID)
      .taskQueues.list()
  ).find((entry) => {
    return entry.friendlyName === 'Everyone';
  });

  if (!queue) {
    console.error('Could not find relevant "Everyone" queue in workspace');
    return { setupDone: false };
  }

  const { sid: VOICE_CHANNEL_SID } = (
    await twilioClient.taskrouter
      .workspaces(TWILIO_WORKSPACE_SID)
      .taskChannels.list()
  ).find((entry) => {
    return entry.uniqueName === 'voice';
  });

  if (context.TWILIO_WORKFLOW_SID) {
    return {
      setupDone: true,
      TWILIO_WORKSPACE_SID,
      TWILIO_WORKFLOW_SID: context.TWILIO_WORKFLOW_SID,
      VOICE_CHANNEL_SID,
    };
  }

  const [workflow, error] = await twilioClient.taskrouter
    .workspaces(TWILIO_WORKSPACE_SID)
    .workflows.create({
      friendlyName: 'Outbound Dialer',
      configuration: JSON.stringify({
        task_routing: {
          filters: [
            {
              filter_friendly_name: 'Outbound',
              expression: `targetWorker != null`,
              targets: [
                {
                  queue: queue.sid,
                  expression: `task.targetWorker==worker.contact_uri`,
                  priority: 1000,
                },
              ],
            },
          ],
        },
      }),
    })
    .then(
      (result) => [result],
      (error) => [null, error]
    );

  if (!workflow) {
    console.error('Failed to create a new Workflow');
    console.error(error);
    return { setupDone: false };
  }

  const TWILIO_WORKFLOW_SID = workflow.sid;
  await helpers.environment.setEnvironmentVariable(
    context,
    currentEnvironment,
    'TWILIO_WORKFLOW_SID',
    TWILIO_WORKFLOW_SID
  );

  return {
    setupDone: true,
    TWILIO_WORKSPACE_SID,
    TWILIO_WORKFLOW_SID,
    VOICE_CHANNEL_SID,
  };
};

exports.isConfigured = (context) => {
  return (
    isNotEmptyString(context.TWILIO_PHONE_NUMBER) &&
    isNotEmptyString(context.TWILIO_WORKFLOW_SID) &&
    isNotEmptyString(context.TWILIO_WORKSPACE_SID)
  );
};
