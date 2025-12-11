import {
  init,
  browserTracingIntegration,
  replayIntegration,
  captureConsoleIntegration,
  feedbackIntegration,
  consoleLoggingIntegration,
  breadcrumbsIntegration,
  browserProfilingIntegration,
} from '@sentry/react';

import { SENTRY_BASIC_CONFIG, SENTRY_NETWORK_ALLOW_URLS } from '../shared/constant/senty-constants';

init({
  ...SENTRY_BASIC_CONFIG,
  enableLogs: true,
  integrations: [
    browserTracingIntegration(),
    browserProfilingIntegration(),
    breadcrumbsIntegration(),
    replayIntegration({
      networkDetailAllowUrls: SENTRY_NETWORK_ALLOW_URLS,
      // Set to false to disable text masking
      maskAllText: false,
      // Set to false to disable media blocking
      blockAllMedia: false,
      minReplayDuration: 40000,
      maxReplayDuration: 60000,
      ignore: ['.ignore-me'],
    }),
    captureConsoleIntegration({
      // Only capture console errors as Sentry events to avoid noise
      levels: ['error'],
    }),
    feedbackIntegration({
      colorScheme: 'system',
      autoInject: false,
      showName: false,
    }),
    consoleLoggingIntegration({
      levels: ['warn', 'error', 'info'],
    }),
  ],
  tracesSampleRate: SENTRY_BASIC_CONFIG.tracesSampleRate,
  profilesSampleRate: SENTRY_BASIC_CONFIG.profilesSampleRate,
  tracePropagationTargets: SENTRY_BASIC_CONFIG.tracePropagationTargets,
});
