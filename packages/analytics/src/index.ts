// Main exports
export { Analytics, ScopedAnalytics, createAnalytics } from './analytics.js';

// Types
export type {
  AnalyticsProvider,
  AnalyticsConfig,
  AnalyticsContext,
  EventProperties,
  UserProperties,
  EventName,
  EventData,
  AllEvents,
  TransactionEvents,
  AuthEvents,
  AppEvents,
  ErrorEvents,
  NavigationEvents,
  WebEvents,
  BackupEvents,
} from './types.js';

// Providers
export { BaseAnalyticsProvider } from './providers/base.js';
export { MixpanelProvider, type MixpanelConfig } from './providers/mixpanel.js';
export { ConsoleProvider } from './providers/console.js';

// Event trackers
export {
  TransactionTracker,
  TransactionSession,
  BridgeSession,
  CrossVmSession,
  ChildAccountTracker,
  ChildAccountSession,
  ValidationTracker,
} from './events/send.js';

export {
  AuthTracker,
  LoginSession,
  WalletCreationSession,
  WalletImportSession,
  BiometricTracker,
} from './events/auth.js';

export { AppTracker, AppSession, ScreenSession, NotificationTracker } from './events/app.js';

export {
  ErrorTracker,
  ErrorSession,
  TransactionErrorSession,
  ErrorReporter,
} from './events/error.js';

export { NavigationTracker, TabSession } from './events/navigation.js';

export { WebTracker, BrowserSession, AuthenticationSession } from './events/web.js';

export { BackupTracker, BackupSession, MultiBackupSession } from './events/backup.js';

// Utilities
export {
  DataSanitizer,
  defaultSanitizer,
  walletSanitizer,
  debugSanitizer,
  productionSanitizer,
  sanitizeEventProperties,
  sanitizeUserProperties,
  createCustomSanitizer,
  type SanitizationRules,
} from './utils/sanitizer.js';

export {
  EventFormatter,
  defaultFormatter,
  formatEventForMixpanel,
  formatEventForConsole,
  formatEventForDebug,
  createCustomFormatter,
  type FormattingRules,
} from './utils/formatter.js';

// Convenience factory functions
export async function createMixpanelAnalytics(config: {
  token: string;
  debug?: boolean;
  context?: Partial<import('./types.js').AnalyticsContext>;
}): Promise<import('./analytics.js').Analytics> {
  const { createAnalytics } = await import('./analytics.js');
  const { MixpanelProvider } = await import('./providers/mixpanel.js');

  const analytics = createAnalytics(config.context);
  const provider = new MixpanelProvider();

  await analytics.addProvider(provider, config);
  return analytics;
}

export async function createConsoleAnalytics(config?: {
  debug?: boolean;
  context?: Partial<import('./types.js').AnalyticsContext>;
}): Promise<import('./analytics.js').Analytics> {
  const { createAnalytics } = await import('./analytics.js');
  const { ConsoleProvider } = await import('./providers/console.js');

  const analytics = createAnalytics(config?.context);
  const provider = new ConsoleProvider();

  await analytics.addProvider(provider, { debug: config?.debug ?? true });
  return analytics;
}

export async function createMultiProviderAnalytics(config: {
  mixpanel?: {
    token: string;
    debug?: boolean;
  };
  console?: {
    debug?: boolean;
  };
  context?: Partial<import('./types.js').AnalyticsContext>;
}): Promise<import('./analytics.js').Analytics> {
  const { createAnalytics } = await import('./analytics.js');

  const analytics = createAnalytics(config.context);

  if (config.mixpanel) {
    const { MixpanelProvider } = await import('./providers/mixpanel.js');
    const mixpanelProvider = new MixpanelProvider();
    await analytics.addProvider(mixpanelProvider, config.mixpanel);
  }

  if (config.console) {
    const { ConsoleProvider } = await import('./providers/console.js');
    const consoleProvider = new ConsoleProvider();
    await analytics.addProvider(consoleProvider, config.console);
  }

  return analytics;
}
