import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Actions, withTheme, Manager, withTaskContext } from '@twilio/flex-ui';
import ConferenceService from '../../services/ConferenceService';

import { useUID } from '@twilio-paste/core/uid-library';
import { Box } from '@twilio-paste/core/box';
import { Button } from '@twilio-paste/core/button';
import { Input } from '@twilio-paste/core/input';
import { Label } from '@twilio-paste/core/label';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalFooterActions,
  ModalHeader,
  ModalHeading,
} from '@twilio-paste/core/modal';

const ConferenceDialog = (props) => {
  const [conferenceTo, setConferenceTo] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const modalHeadingID = useUID();
  const inputRef = React.createRef();
  const inputID = useUID();

  useEffect(() => {
    setIsOpen(props.isOpen);
  }, [props.isOpen]);

  const handleClose = (e) => {
    closeDialog();
    if (e) e.preventDefault();
  };

  const closeDialog = () => {
    Actions.invokeAction('SetComponentState', {
      name: 'ConferenceDialog',
      state: { isOpen: false },
    });
  };

  const handleKeyPress = (e) => {
    const key = e.key;

    if (key === 'Enter') {
      addConferenceParticipant();
      closeDialog();
      e.preventDefault();
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setConferenceTo(value);
  };

  const handleDialButton = (e) => {
    addConferenceParticipant();
    closeDialog();
    e.preventDefault();
  };

  const addConferenceParticipant = async () => {
    const { task } = props;
    const conference = task && (task.conference || {});
    const { conferenceSid } = conference;

    const mainConferenceSid = task.attributes.conference
      ? task.attributes.conference.sid
      : conferenceSid;

    let from;
    if (props.phoneNumber) {
      from = props.phoneNumber;
    } else {
      from =
        Manager.getInstance().serviceConfiguration.outbound_call_flows.default
          .caller_id;
    }

    // Adding entered number to the conference
    console.log(`Adding ${conferenceTo} to conference`);
    let participantCallSid;
    try {
      participantCallSid = await ConferenceService.addParticipant(
        mainConferenceSid,
        from,
        conferenceTo
      );
      ConferenceService.addConnectingParticipant(
        mainConferenceSid,
        participantCallSid,
        'unknown'
      );
    } catch (error) {
      console.error('Error adding conference participant:', error);
    }

    setConferenceTo('');
  };

  return (
    <Modal
      ariaLabelledby={modalHeadingID}
      isOpen={isOpen}
      onDismiss={handleClose}
      // set initial focus here
      initialFocusRef={inputRef}
      size="default"
    >
      <ModalHeader>
        <ModalHeading as="h3" id={modalHeadingID}>
          {
            Manager.getInstance().strings
              .DIALPADExternalTransferPhoneNumberPopupHeader
          }
        </ModalHeading>
      </ModalHeader>
      <ModalBody>
        <Box as="form">
          <Label htmlFor={inputID}>
            {
              Manager.getInstance().strings
                .DIALPADExternalTransferPhoneNumberPopupTitle
            }
          </Label>
          <Input
            id={inputID}
            value={conferenceTo}
            // assign the target ref here
            ref={inputRef}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            type="text"
          />
        </Box>
      </ModalBody>
      <ModalFooter>
        <ModalFooterActions>
          <Button variant="secondary" onClick={handleClose}>
            {
              Manager.getInstance().strings
                .DIALPADExternalTransferPhoneNumberPopupCancel
            }
          </Button>
          <Button variant="primary" onClick={handleDialButton}>
            {
              Manager.getInstance().strings
                .DIALPADExternalTransferPhoneNumberPopupDial
            }
          </Button>
        </ModalFooterActions>
      </ModalFooter>
    </Modal>
  );
};

const mapStateToProps = (state) => {
  const componentViewStates = state.flex.view.componentViewStates;
  const conferenceDialogState =
    componentViewStates && componentViewStates.ConferenceDialog;
  const isOpen = conferenceDialogState && conferenceDialogState.isOpen;
  return {
    isOpen,
    phoneNumber: state.flex.worker.attributes.phone,
  };
};

export default connect(mapStateToProps)(
  withTheme(withTaskContext(ConferenceDialog))
);
