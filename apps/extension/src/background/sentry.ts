/**
 * Check the docs for more information:
 * [Sentry Shared Environments / Browser Extensions]{@link https://docs.sentry.io/platforms/javascript/best-practices/shared-environments/}
 * */

import {
  BrowserClient,
  Scope,
  defaultStackParser,
  browserApiErrorsIntegration,
  breadcrumbsIntegration,
  globalHandlersIntegration,
  consoleLoggingIntegration,
  makeFetchTransport,
} from '@sentry/browser';

import { SENTRY_BASIC_CONFIG } from '../shared/constant/senty-constants';

type IsolatedSentry = {
  scope: Scope;
};

let isolatedSentry: IsolatedSentry | undefined = undefined;

const getIsolatedSentry = (): IsolatedSentry => {
  if (!isolatedSentry) {
    const sentryClient = new BrowserClient({
      ...SENTRY_BASIC_CONFIG,
      enableLogs: true, // Enable structured logging
      transport: makeFetchTransport,
      stackParser: defaultStackParser,
      integrations: [
        browserApiErrorsIntegration(),
        breadcrumbsIntegration(),
        globalHandlersIntegration(),
        // Capture console.warn and console.error as logs
        consoleLoggingIntegration({
          levels: ['warn', 'error', 'info'],
        }),
      ],
    });

    const sentryScope = new Scope();
    sentryScope.setClient(sentryClient);
    sentryClient.init();

    isolatedSentry = {
      scope: sentryScope,
    };
  }

  return isolatedSentry;
};

export const sentry = getIsolatedSentry();

/**
 * Set user identification in Sentry for error tracking
 * @param userData User information to track in Sentry
 */
export const setUserInSentry = (
  userData: {
    uid?: string;
    username?: string;
    address?: string;
  } | null
): void => {
  const { scope } = getIsolatedSentry();

  if (!userData) {
    // Clear user context on logout
    scope.setUser(null);
    scope.setContext('wallet', null);
    return;
  }

  // Set basic user information
  scope.setUser({
    id: userData.uid,
    username: userData.username,
  });

  // Set additional wallet context
  scope.setContext('wallet', {
    address: userData.address,
  });
};
