import { mixpanelTrack } from './mixpanel';

class LogListener {
  constructor() {}

  init() {
    chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
      // Only track errors
      if (message.type === 'console_error') {
        mixpanelTrack.track('error', {
          code: message.code,
          category: 'console',
          message: message.message,
          extra: message.stack,
          value: message.data,
        });
      }
    });
  }
}

export default new LogListener();
