import {
  init,
  browserTracingIntegration,
  replayIntegration,
  captureConsoleIntegration,
  feedbackIntegration,
  consoleLoggingIntegration,
} from '@sentry/react';

import { SENTRY_BASIC_CONFIG } from '../shared/constant/senty-constants';

init({
  ...SENTRY_BASIC_CONFIG,
  enableLogs: true,
  integrations: [
    browserTracingIntegration(),
    replayIntegration({
      // Set to false to disable text masking
      maskAllText: false,
      // Set to false to disable media blocking
      blockAllMedia: false,
      minReplayDuration: 40000,
      maxReplayDuration: 60000,
      ignore: ['.ignore-me'],
    }),
    captureConsoleIntegration({
      levels: ['error', 'log', 'warn', 'info'],
    }),
    feedbackIntegration({
      colorScheme: 'system',
      autoInject: false,
    }),
    consoleLoggingIntegration({
      levels: ['warn', 'error', 'info'],
    }),
  ],
});
