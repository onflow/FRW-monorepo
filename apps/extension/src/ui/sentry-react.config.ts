import {
  init,
  browserTracingIntegration,
  replayIntegration,
  captureConsoleIntegration,
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
    }),
    captureConsoleIntegration({
      levels: ['error'],
    }),
  ],
});
