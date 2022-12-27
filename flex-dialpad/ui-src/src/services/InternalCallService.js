import ApiService from './ApiService';

class InternalCallService extends ApiService {
  acceptInternalTask = async (reservation, taskSid) => {
    if (typeof reservation.task.attributes.conference !== 'undefined') {
      reservation.call(
        reservation.task.attributes.from,
        `${this.serverlessDomain}/internal-call/agent-join-conference?conferenceName=${reservation.task.attributes.conference.friendlyName}`,
        {
          accept: true,
        }
      );
    } else {
      reservation.call(
        reservation.task.attributes.from,
        `${this.serverlessDomain}/internal-call/agent-outbound-join?taskSid=${taskSid}`,
        {
          accept: true,
        }
      );
    }
  };

  rejectInternalTask = async (task) => {
    await task._reservation.accept();
    await task.wrapUp();
    await task.complete();

    return new Promise((resolve, reject) => {
      const taskSid = task.attributes.conferenceSid;

      const encodedParams = {
        taskSid,
        Token: encodeURIComponent(
          this.manager.store.getState().flex.session.ssoTokenPayload.token
        ),
      };

      this.fetchJsonWithReject(
        `${this.serverlessDomain}/internal-call/cleanup-rejected-task`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: this.buildBody(encodedParams),
        }
      )
        .then((response) => {
          console.log('Outbound call has been placed into wrapping');
          resolve(response);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  };
}

const internalCallService = new InternalCallService();

export default internalCallService;
