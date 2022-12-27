import React from 'react';
import InternalDialpad from './InternalDialpad';

export const loadInternalCallInterface = (flex, manager) => {
  flex.OutboundDialerPanel.Content.add(
    <InternalDialpad key="select-dialpad" flex={flex} manager={manager} />
  );

  // OOB transfer does not work with internal calls
  const isInternalCall = (props) => props.task.attributes.client_call === true;
  flex.CallCanvasActions.Content.remove('directory', { if: isInternalCall });
};
