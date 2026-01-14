// Main exports
export { Analytics, ScopedAnalytics, createAnalytics } from './analytics';

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
} from './types';

// Providers
export { BaseAnalyticsProvider } from './providers/base';
export { MixpanelProvider, type MixpanelConfig } from './providers/mixpanel';
export { ConsoleProvider } from './providers/console';

// Event trackers
export {
  TransactionTracker,
  TransactionSession,
  BridgeSession,
  CrossVmSession,
  ChildAccountTracker,
  ChildAccountSession,
  ValidationTracker,
} from './events/send';

export {
  AuthTracker,
  LoginSession,
  WalletCreationSession,
  WalletImportSession,
  BiometricTracker,
} from './events/auth';

export { AppTracker, AppSession, ScreenSession, NotificationTracker } from './events/app';

export { ErrorTracker, ErrorSession, TransactionErrorSession, ErrorReporter } from './events/error';

export { NavigationTracker, TabSession } from './events/navigation';

export { WebTracker, BrowserSession, AuthenticationSession } from './events/web';

export { BackupTracker, BackupSession, MultiBackupSession } from './events/backup';

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
} from './utils/sanitizer';

export {
  EventFormatter,
  defaultFormatter,
  formatEventForMixpanel,
  formatEventForConsole,
  formatEventForDebug,
  createCustomFormatter,
  type FormattingRules,
} from './utils/formatter';

// Convenience factory functions
export async function createMixpanelAnalytics(config: {
  token: string;
  debug?: boolean;
  context?: Partial<import('./types').AnalyticsContext>;
}): Promise<import('./analytics').Analytics> {
  const { createAnalytics } = await import('./analytics');
  const { MixpanelProvider } = await import('./providers/mixpanel');

  const analytics = createAnalytics(config.context);
  const provider = new MixpanelProvider();

  await analytics.addProvider(provider, config);
  return analytics;
}

export async function createConsoleAnalytics(config?: {
  debug?: boolean;
  context?: Partial<import('./types').AnalyticsContext>;
}): Promise<import('./analytics').Analytics> {
  const { createAnalytics } = await import('./analytics');
  const { ConsoleProvider } = await import('./providers/console');

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
  context?: Partial<import('./types').AnalyticsContext>;
}): Promise<import('./analytics').Analytics> {
  const { createAnalytics } = await import('./analytics');

  const analytics = createAnalytics(config.context);

  if (config.mixpanel) {
    const { MixpanelProvider } = await import('./providers/mixpanel');
    const mixpanelProvider = new MixpanelProvider();
    await analytics.addProvider(mixpanelProvider, config.mixpanel);
  }

  if (config.console) {
    const { ConsoleProvider } = await import('./providers/console');
    const consoleProvider = new ConsoleProvider();
    await analytics.addProvider(consoleProvider, config.console);
  }

  return analytics;
}
