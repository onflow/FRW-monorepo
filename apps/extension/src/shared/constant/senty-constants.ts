import type { BrowserOptions } from '@sentry/browser';

export const IS_DEV = process.env.NODE_ENV === 'development';

/** From package.json */

const eventCounter: Record<string, number> = {};

export const SENTRY_BASIC_CONFIG: BrowserOptions = {
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.NODE_ENV,

  enabled: true,

  tracesSampleRate: IS_DEV ? 0 : 1.0, //  Capture 100% of the transactions
  replaysSessionSampleRate: IS_DEV ? 0 : 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: IS_DEV ? 0 : 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.

  beforeSend(event, hint) {
    const error = hint.originalException as Error;
    const message = String(typeof error === 'string' ? error : error && error.message);

    if (message) {
      // filtering out service-worker known connection errors:
      if (
        message.startsWith(
          'Error: Could not establish connection. Receiving end does not exist.'
        ) ||
        message.startsWith('Failed to send message to the focused tab') ||
        message.startsWith('Failed to send message "changeTab"')
      ) {
        return null;
      }

      // filtering out unhandled errors in case of unhandled behavior:
      eventCounter[message] = (eventCounter[message] || 0) + 1;
      if (eventCounter[message] > 5) return null;
    }

    return event;
  },
};
