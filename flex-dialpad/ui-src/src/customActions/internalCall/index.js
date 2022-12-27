import { request } from '../../helpers/request';

export const isInternalCall = (payload) =>
  payload.task.attributes.client_call === true;

export const acceptInternalTask = async ({ reservation, payload }) => {
  const { REACT_APP_SERVICE_BASE_URL } = process.env;

  await payload.task.setAttributes({
    ...payload.task.attributes,
    outbound_to: payload.task.attributes.name,
  });

  if (typeof reservation.task.attributes.conference !== 'undefined') {
    reservation.call(
      reservation.task.attributes.from,
      `${REACT_APP_SERVICE_BASE_URL}/internal-call/agent-join-conference?conferenceName=${reservation.task.attributes.conference.friendlyName}`,
      {
        accept: true,
      }
    );
  } else {
    reservation.call(
      reservation.task.attributes.from,
      `${REACT_APP_SERVICE_BASE_URL}/internal-call/agent-outbound-join?taskSid=${payload.task.taskSid}`,
      {
        accept: true,
      }
    );
  }
};

export const rejectInternalTask = async ({ manager, payload }) => {
  await payload.task._reservation.accept();
  await payload.task.wrapUp();
  await payload.task.complete();

  const taskSid = payload.task.attributes.conferenceSid;

  request('internal-call/cleanup-rejected-task', manager, {
    taskSid,
  })
    .then((response) => {
      console.log('Outbound call has been placed into wrapping');
    })
    .catch((error) => {
      console.log(error);
    });
};

export const toggleHoldInternalCall = ({
  task,
  manager,
  hold,
  resolve,
  reject,
}) => {
  const conference = task.attributes.conference
    ? task.attributes.conference.sid
    : task.attributes.conferenceSid;

  const participant = task.attributes.conference.participants
    ? task.attributes.conference.participants.worker
    : task.attributes.worker_call_sid;

  return request('internal-call/hold-call', manager, {
    conference,
    participant,
    hold,
  })
    .then((response) => {
      resolve(response);
    })
    .catch((error) => {
      console.log(error);
      reject(error);
    });
};
