import {
  init,
  browserTracingIntegration,
  replayIntegration,
  consoleLoggingIntegration,
  feedbackIntegration,
} from '@sentry/react';

import { SENTRY_BASIC_CONFIG } from '../shared/constant/senty-constants';

init({
  ...SENTRY_BASIC_CONFIG,
  enableLogs: true, // Enable structured logging
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
    // Capture console.warn and console.error as logs
    consoleLoggingIntegration({
      levels: ['warn', 'error'],
    }),
    feedbackIntegration({
      colorScheme: 'system',
      autoInject: false,
    }),
  ],
});

// User context is set by background service and automatically shared
// No need to export setUserInSentry from UI
