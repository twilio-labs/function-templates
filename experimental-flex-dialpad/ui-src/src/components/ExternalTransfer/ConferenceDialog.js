import * as React from 'react';
import { connect } from 'react-redux';
import { Actions, withTheme, Manager, withTaskContext } from '@twilio/flex-ui';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';
import ConferenceService from '../../helpers/ConferenceService';

class ConferenceDialog extends React.Component {
  state = {
    conferenceTo: '',
  };

  handleClose = () => {
    this.closeDialog();
  };

  closeDialog = () => {
    Actions.invokeAction('SetComponentState', {
      name: 'ConferenceDialog',
      state: { isOpen: false },
    });
  };

  handleKeyPress = (e) => {
    const key = e.key;

    if (key === 'Enter') {
      this.addConferenceParticipant();
      this.closeDialog();
    }
  };

  handleChange = (e) => {
    const value = e.target.value;
    this.setState({ conferenceTo: value });
  };

  handleDialButton = () => {
    this.addConferenceParticipant();
    this.closeDialog();
  };

  addConferenceParticipant = async () => {
    const to = this.state.conferenceTo;

    const { task } = this.props;
    const conference = task && (task.conference || {});
    const { conferenceSid } = conference;

    const mainConferenceSid = task.attributes.conference
      ? task.attributes.conference.sid
      : conferenceSid;

    let from;
    if (this.props.phoneNumber) {
      from = this.props.phoneNumber;
    } else {
      from =
        Manager.getInstance().serviceConfiguration.outbound_call_flows.default
          .caller_id;
    }

    // Adding entered number to the conference
    console.log(`Adding ${to} to conference`);
    let participantCallSid;
    try {
      participantCallSid = await ConferenceService.addParticipant(
        mainConferenceSid,
        from,
        to
      );
      ConferenceService.addConnectingParticipant(
        mainConferenceSid,
        participantCallSid,
        'unknown'
      );
    } catch (error) {
      console.error('Error adding conference participant:', error);
    }
    this.setState({ conferenceTo: '' });
  };

  render() {
    return (
      <Dialog open={this.props.isOpen || false} onClose={this.handleClose}>
        <DialogContent>
          <DialogContentText>
            {
              Manager.getInstance().strings
                .DIALPADExternalTransferPhoneNumberPopupHeader
            }
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="conferenceNumber"
            label={
              Manager.getInstance().strings
                .DIALPADExternalTransferPhoneNumberPopupTitle
            }
            fullWidth
            value={this.state.conferenceTo}
            onKeyPress={this.handleKeyPress}
            onChange={this.handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleDialButton} color="primary">
            {
              Manager.getInstance().strings
                .DIALPADExternalTransferPhoneNumberPopupDial
            }
          </Button>
          <Button onClick={this.closeDialog} color="secondary">
            {
              Manager.getInstance().strings
                .DIALPADExternalTransferPhoneNumberPopupCancel
            }
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

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
