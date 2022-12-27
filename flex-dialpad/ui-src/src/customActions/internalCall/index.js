import ConferenceService from '../../services/ConferenceService';
import InternalCallService from '../../services/InternalCallService';

export const isInternalCall = (payload) =>
  payload.task.attributes.client_call === true;

export const beforeAcceptTask = async (payload, abortFunction) => {
  if (!isInternalCall(payload)) {
    return false;
  }

  abortFunction();
  await InternalCallService.acceptInternalTask(
    payload.task.sourceObject,
    payload.task.taskSid
  );
  return true;
};

export const beforeRejectTask = async (payload, abortFunction) => {
  if (!isInternalCall(payload)) {
    return false;
  }

  abortFunction();
  await InternalCallService.rejectInternalTask(payload.task);
  return true;
};

export const beforeHoldCall = async (payload, abortFunction) => {
  if (!isInternalCall(payload)) {
    return false;
  }

  const { task } = payload;
  const conference = task.attributes.conference
    ? task.attributes.conference.sid
    : task.attributes.conferenceSid;

  const participant = task.attributes.conference.participants
    ? task.attributes.conference.participants.worker
    : task.attributes.worker_call_sid;

  await ConferenceService.holdParticipant(conference, participant);
  abortFunction();
  return true;
};

export const beforeUnholdCall = async (payload, abortFunction) => {
  if (!isInternalCall(payload)) {
    return false;
  }

  const { task } = payload;
  const conference = task.attributes.conference
    ? task.attributes.conference.sid
    : task.attributes.conferenceSid;

  const participant = task.attributes.conference.participants
    ? task.attributes.conference.participants.worker
    : task.attributes.worker_call_sid;

  await ConferenceService.unholdParticipant(conference, participant);
  abortFunction();
  return true;
};
