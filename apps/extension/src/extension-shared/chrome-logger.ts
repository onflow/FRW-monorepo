import { type ConsoleTracker, setConsoleTracker } from '@onflow/frw-shared/utils';

const DEPLOYMENT_ENV = process.env.DEPLOYMENT_ENV;
const IS_BETA = process.env.IS_BETA === 'true';
const IS_PROD = process.env.NODE_ENV === 'production' || DEPLOYMENT_ENV === 'production' || IS_BETA;

const extensionId =
  chrome?.runtime?.id || IS_BETA
    ? 'lpgbokkinafiehohpkiccnlncmeonkfc'
    : DEPLOYMENT_ENV === 'production'
      ? 'hpclkefagolihohboafpheddmmgdffjm'
      : 'cfiagdgiikmjgfjnlballglniejjgegi';

/**
 * Chrome extension specific console tracker that sends messages via runtime messaging
 */
export const chromeConsoleTracker: ConsoleTracker = (type, message, stack, code) => {
  try {
    chrome?.runtime?.sendMessage(extensionId, {
      type,
      message,
      stack,
      code,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Could not track console error', error);
  }
};

/**
 * Initialize Chrome console tracking
 * Call this once at extension startup
 */
export function initializeChromeLogging() {
  setConsoleTracker(chromeConsoleTracker, IS_PROD);
}
