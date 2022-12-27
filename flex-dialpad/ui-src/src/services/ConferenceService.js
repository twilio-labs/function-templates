/* Created for use with external transfer extensions

  merged from excellent work done by Terence Rogers
  https://github.com/trogers-twilio/plugin-external-conference-warm-transfer

*/
import { ConferenceParticipant } from '@twilio/flex-ui';
import ApiService from './ApiService';

class ConferenceService extends ApiService {
  _toggleParticipantHold = async (conference, participantSid, hold) => {
    return new Promise((resolve, reject) => {
      const encodedParams = {
        conference,
        participant: participantSid,
        hold,
        Token: encodeURIComponent(
          this.manager.store.getState().flex.session.ssoTokenPayload.token
        ),
      };

      this.fetchJsonWithReject(
        `${this.serverlessDomain}/common/flex/programmable-voice/hold-conference-participant`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: this.buildBody(encodedParams),
        }
      )
        .then((response) => {
          console.log(
            `${hold ? 'Hold' : 'Unhold'} successful for participant`,
            participantSid
          );
          resolve(response.participantsResponse.sid);
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

  setEndConferenceOnExit = async (
    conference,
    participantSid,
    endConferenceOnExit
  ) => {
    return new Promise((resolve, reject) => {
      const encodedParams = {
        conference,
        participant: participantSid,
        endConferenceOnExit,
        Token: encodeURIComponent(
          this.manager.store.getState().flex.session.ssoTokenPayload.token
        ),
      };

      this.fetchJsonWithReject(
        `${this.serverlessDomain}/external-transfer/update-conference-participant`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: this.buildBody(encodedParams),
        }
      )
        .then((response) => {
          console.log(`Participant ${participantSid} updated:\r\n`, response);
          resolve(response.participantsResponse.sid);
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

  addParticipant = async (taskSid, from, to) => {
    return new Promise((resolve, reject) => {
      const encodedParams = {
        taskSid,
        from,
        to,
        Token: encodeURIComponent(
          this.manager.store.getState().flex.session.ssoTokenPayload.token
        ),
      };

      this.fetchJsonWithReject(
        `${this.serverlessDomain}/external-transfer/add-conference-participant`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: this.buildBody(encodedParams),
        }
      )
        .then((response) => {
          console.log('Participant added:\r\n  ', response);
          resolve(response.participantsResponse.callSid);
        })
        .catch((error) => {
          console.log('There is an error while adding participan', error);
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
      const encodedParams = {
        conference,
        participant: participantSid,
        Token: encodeURIComponent(
          this.manager.store.getState().flex.session.ssoTokenPayload.token
        ),
      };

      this.fetchJsonWithReject(
        `${this.serverlessDomain}/external-transfer/remove-conference-participant`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: this.buildBody(encodedParams),
        }
      )
        .then((response) => {
          console.log(`Participant ${participantSid} removed from conference`);
          resolve(participantSid);
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

  getCallProperties = async (callSid) => {
    return new Promise((resolve, reject) => {
      const encodedParams = {
        callSid,
        Token: encodeURIComponent(
          this.manager.store.getState().flex.session.ssoTokenPayload.token
        ),
      };

      this.fetchJsonWithReject(
        `${this.serverlessDomain}/external-transfer/get-call-properties`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: this.buildBody(encodedParams),
        }
      )
        .then((resp) => {
          console.log('The call properties are', resp.callProperties);
          resolve(resp.callProperties);
        })
        .catch((error) => {
          console.log('There is an error', error);
          reject(error);
        });
    });
  };
}

const conferenceService = new ConferenceService();

export default conferenceService;
