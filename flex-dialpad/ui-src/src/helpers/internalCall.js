export const makeInternalCall = ({ manager, selectedWorker }) => {
  const { workflow_sid, queue_sid } =
    manager.serviceConfiguration.outbound_call_flows.default;

  const { REACT_APP_TASK_CHANNEL_SID: taskChannelSid } = process.env;

  const {
    attributes: { contact_uri: from_uri, full_name: fromFullName },
    name: fromName,
  } = manager.workerClient;

  const {
    attributes: { full_name, contact_uri: target_uri },
    friendly_name,
  } = selectedWorker;

  manager.workerClient.createTask(
    target_uri,
    from_uri,
    workflow_sid,
    queue_sid,
    {
      attributes: {
        to: target_uri,
        direction: 'outbound',
        name: full_name || friendly_name,
        fromName: fromFullName || fromName,
        targetWorker: from_uri,
        autoAnswer: 'true',
        client_call: true,
      },
      taskChannelSid,
    }
  );
};
