import * as Flex from '@twilio/flex-ui';

export default (flex, manager) => {
  registerCustomNotifications(flex, manager);
};

export const CustomNotifications = {
  FailedHangupNotification: 'PS_FailedHangupOnConferenceWithExternalParties',
};

function registerCustomNotifications(flex, manager) {
  flex.Notifications.registerNotification({
    id: CustomNotifications.FailedHangupNotification,
    type: Flex.NotificationType.error,
    content:
      'Hangup call abandoned: Failed to take all participants off hold while hanging up the call. If this issue persists, please try unholding participants manually before leaving the call',
  });
}
