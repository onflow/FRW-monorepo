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
      networkDetailAllowUrls: [
        'rest-mainnet.onflow.org',
        'rest-testnet.onflow.org',
        'mainnet.evm.nodes.onflow.org',
        'testnet.evm.nodes.onflow.org',
        'lilico.app',
        'web.api.wallet.flow.com',
        'api.lilico.app',
      ],
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
});
