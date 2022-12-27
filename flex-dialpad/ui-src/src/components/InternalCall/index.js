import React from 'react';
import InternalDialpad from './InternalDialpad';

export const loadInternalCallInterface = (flex, manager) => {
  flex.OutboundDialerPanel.Content.add(
    <InternalDialpad key="select-dialpad" flex={flex} manager={manager} />
  );
};

export const makeInternalCall = ({ manager, selectedWorker, workerList }) => {
  const { workflow_sid, queue_sid } =
    manager.serviceConfiguration.outbound_call_flows.default;

  const { REACT_APP_TASK_CHANNEL_SID: taskChannelSid } = process.env;

  const {
    attributes: { contact_uri, full_name: fromFullName },
    name: fromName,
  } = manager.workerClient;

  const {
    attributes: { full_name },
    friendly_name,
  } = workerList.find(
    (worker) => worker.attributes.contact_uri === selectedWorker
  );

  manager.workerClient.createTask(
    selectedWorker,
    contact_uri,
    workflow_sid,
    queue_sid,
    {
      attributes: {
        to: selectedWorker,
        direction: 'outbound',
        name: full_name || friendly_name,
        fromName: fromFullName || fromName,
        targetWorker: contact_uri,
        autoAnswer: 'true',
        client_call: true,
      },
      taskChannelSid,
    }
  );
};
