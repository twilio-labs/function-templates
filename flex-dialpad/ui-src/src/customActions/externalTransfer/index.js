import ConferenceService from '../../services/ConferenceService';

export const kickExternalTransferParticipant = (payload) => {
  const { task, targetSid } = payload;

  const conference = task.attributes.conference
    ? task.attributes.conference.sid
    : task.conference.conferenceSid;

  const participantSid = targetSid;

  console.log(`Removing participant ${participantSid} from conference`);
  return ConferenceService.removeParticipant(conference, participantSid);
};
