import { analyticsService } from '@/core/service';

import { stripSensitive } from '@/shared/utils';

class LogListener {
  constructor() {}

  init() {
    chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
      // Only track errors
      if (message.type === 'console_error') {
        analyticsService.track('error', {
          code: message.code,
          category: 'console',
          message: stripSensitive(message.message),
          extra: stripSensitive(message.stack),
          value: message.code,
        });
      }
    });
  }
}

export const logListener = new LogListener();
