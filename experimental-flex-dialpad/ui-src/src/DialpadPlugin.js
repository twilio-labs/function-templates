import { FlexPlugin } from '@twilio/flex-plugin';

import registerCustomActions from './customActions';
import registerCustomNotifications from './notifications';
import { loadExternalTransferInterface } from './components/ExternalTransfer';
import { loadInternalCallInterface } from './components/InternalCall';

const PLUGIN_NAME = 'DialpadPlugin';

export default class DialpadPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  init(flex, manager) {
    loadExternalTransferInterface.bind(this)(flex, manager);

    loadInternalCallInterface.bind(this)(flex, manager);

    registerCustomActions(manager);
    registerCustomNotifications(flex, manager);
  }
}
