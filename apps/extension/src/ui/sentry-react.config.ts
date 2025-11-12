import {
  init,
  browserTracingIntegration,
  replayIntegration,
  captureConsoleIntegration,
  feedbackIntegration,
} from '@sentry/react';

import { SENTRY_BASIC_CONFIG } from '../shared/constant/senty-constants';

init({
  ...SENTRY_BASIC_CONFIG,
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
      levels: ['error'],
    }),
    feedbackIntegration({
      colorScheme: 'system',
      autoInject: false,
    }),
  ],
});
