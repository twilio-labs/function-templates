/* Created for use with external transfer extensions

  merged from excellent work done by Terence Rogers
  https://github.com/trogers-twilio/plugin-external-conference-warm-transfer

*/
import { ConferenceParticipant, Manager } from '@twilio/flex-ui';
import { request } from './request';

class ConferenceService {
  manager = Manager.getInstance();

  _toggleParticipantHold = (conference, participantSid, hold) => {
    return new Promise((resolve, reject) => {
      request('external-transfer/hold-conference-participant', this.manager, {
        conference,
        participant: participantSid,
        hold,
      })
        .then((response) => {
          console.log(
            `${hold ? 'Hold' : 'Unhold'} successful for participant`,
            participantSid
          );
          resolve();
        })
        .catch((error) => {
          console.error(
            `Error ${
              hold ? 'holding' : 'unholding'
            } participant ${participantSid}\r\n`,
            error
          );
          reject(error);
        });
    });
  };

  setEndConferenceOnExit = (
    conference,
    participantSid,
    endConferenceOnExit
  ) => {
    return new Promise((resolve, reject) => {
      request('external-transfer/update-conference-participant', this.manager, {
        conference,
        participant: participantSid,
        endConferenceOnExit,
      })
        .then((response) => {
          console.log(`Participant ${participantSid} updated:\r\n`, response);
          resolve();
        })
        .catch((error) => {
          console.error(
            `Error updating participant ${participantSid}\r\n`,
            error
          );
          reject(error);
        });
    });
  };

  addParticipant = (taskSid, from, to) => {
    return new Promise((resolve, reject) => {
      request('external-transfer/add-conference-participant', this.manager, {
        taskSid,
        from,
        to,
      })
        .then((response) => {
          console.log('Participant added:\r\n  ', response);
          resolve(response.callSid);
        })
        .catch((error) => {
          console.error(`Error adding participant ${to}\r\n`, error);
          reject(error);
        });
    });
  };

  addConnectingParticipant = (conferenceSid, callSid, participantType) => {
    const flexState = this.manager.store.getState().flex;
    const dispatch = this.manager.store.dispatch;

    const conferenceStates = flexState.conferences.states;
    const conferences = new Set();

    console.log('Populating conferences set');
    conferenceStates.forEach((conference) => {
      const currentConference = conference.source;
      console.log('Checking conference SID:', currentConference.conferenceSid);
      if (currentConference.conferenceSid !== conferenceSid) {
        console.log('Not the desired conference');
        conferences.add(currentConference);
      } else {
        const participants = currentConference.participants;
        const fakeSource = {
          connecting: true,
          participant_type: participantType,
          status: 'joined',
        };

        const fakeParticipant = new ConferenceParticipant(fakeSource, callSid);
        console.log('Adding fake participant:', fakeParticipant);
        participants.push(fakeParticipant);
        conferences.add(conference.source);
      }
    });
    console.log('Updating conferences:', conferences);
    dispatch({ type: 'CONFERENCE_MULTIPLE_UPDATE', payload: { conferences } });
  };

  holdParticipant = (conference, participantSid) => {
    return this._toggleParticipantHold(conference, participantSid, true);
  };

  unholdParticipant = (conference, participantSid) => {
    return this._toggleParticipantHold(conference, participantSid, false);
  };

  removeParticipant = (conference, participantSid) => {
    return new Promise((resolve, reject) => {
      request('external-transfer/remove-conference-participant', this.manager, {
        conference,
        participant: participantSid,
      })
        .then((response) => {
          console.log(`Participant ${participantSid} removed from conference`);
          resolve(response.callSid);
        })
        .catch((error) => {
          console.error(
            `Error removing participant ${participantSid} from conference\r\n`,
            error
          );
          reject(error);
        });
    });
  };
}

const conferenceService = new ConferenceService();

export default conferenceService;
