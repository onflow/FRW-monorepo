export interface AnalyticsProvider {
  initialize(config: AnalyticsConfig): Promise<void>;
  track(eventName: string, properties?: EventProperties): Promise<void>;
  identify(userId: string, userProperties?: UserProperties): Promise<void>;
  setUserProperties(properties: UserProperties): Promise<void>;
  reset(): Promise<void>;
  flush(): Promise<void>;
}

export interface AnalyticsConfig {
  token?: string;
  debug?: boolean;
  [key: string]: unknown;
}

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined | string[];
}

export interface UserProperties {
  [key: string]: string | number | boolean | null | undefined;
}

export interface TransactionEvents {
  // Core Transaction Events
  transactionInitiated: {
    assetType?: string;
    networkType?: 'flow' | 'evm' | 'crossVm';
    strategyType?: 'direct' | 'bridge' | 'childAccount' | 'crossVm';
    amount?: string;
    isCrossVm?: boolean;
    cadenceHash?: string;
    authorizations?: string[];
    proposer: string;
    payer: string;
  } & EventProperties;

  strategySelected: {
    strategyName?: string;
    assetType?: string;
    networkType?: 'flow' | 'evm' | 'crossVm';
    executionPath?: string;
  } & EventProperties;

  transactionPrepared: {
    strategyName?: string;
    preparationTimeMs?: number;
    gasEstimate?: string;
  } & EventProperties;

  transactionSigned: {
    strategyName?: string;
    signatureMethod?: 'wallet' | 'keystore' | 'hardware';
    signingTimeMs?: number;
  } & EventProperties;

  transactionSubmitted: {
    strategyName?: string;
    transactionHash?: string;
    submissionTimeMs?: number;
    tix?: string;
  } & EventProperties;

  transactionCompleted: {
    strategyName?: string;
    success?: boolean;
    totalTimeMs?: number;
    gasUsed?: string;
    tix?: string;
  } & EventProperties;

  // Strategy-Specific Events
  bridgeOperation: {
    bridgeType?: string;
    fromNetwork?: string;
    toNetwork?: string;
    assetType?: string;
    assetId?: string;
    assetAddress?: string;
  } & EventProperties;

  childAccountTransaction: {
    operationType?: 'create' | 'fund' | 'transfer';
    childCount?: number;
    parentAddress?: string;
  } & EventProperties;

  crossVmTransfer: {
    fromVm?: 'flow' | 'evm';
    toVm?: 'flow' | 'evm';
    bridgeUsed?: string;
    assetType?: string;
  } & EventProperties;

  // Error and Performance Events
  transactionError: {
    strategyName?: string;
    errorType?: 'network' | 'validation' | 'signing' | 'submission' | 'gas' | 'unknown';
    errorCode?: string;
    stepFailed?: 'initiation' | 'preparation' | 'signing' | 'submission' | 'confirmation';
  } & EventProperties;

  strategyPerformance: {
    strategyName?: string;
    executionTimeMs?: number;
    gasEfficiency?: number;
  } & EventProperties;

  validationError: {
    validationType?: 'amount' | 'address' | 'balance' | 'network';
    fieldName?: string;
    errorMessage?: string;
  } & EventProperties;
}

export interface AuthEvents {
  loginInitiated: {
    method?: 'password' | 'biometric' | 'pin' | 'google' | 'apple';
  } & EventProperties;
  loginCompleted: {
    method?: 'password' | 'biometric' | 'pin' | 'google' | 'apple';
    durationMs?: number;
  } & EventProperties;
  loginFailed: {
    method?: 'password' | 'biometric' | 'pin' | 'google' | 'apple';
    errorCode?: string;
    errorMessage?: string;
  } & EventProperties;
  logout: {
    method?: 'manual' | 'timeout' | 'security';
  } & EventProperties;
  walletCreated: {
    method?: 'new' | 'import' | 'recovery';
    source?: 'onboarding' | 'settings';
  } & EventProperties;
  walletImported: {
    method?: 'seedPhrase' | 'privateKey' | 'keystore';
    success?: boolean;
  } & EventProperties;
  biometricEnabled: {
    type?: 'fingerprint' | 'faceId' | 'touchId';
  } & EventProperties;
  biometricDisabled: EventProperties;
}

export interface AppEvents {
  appOpened: {
    source?: 'direct' | 'notification' | 'deeplink' | 'widget';
    coldStart?: boolean;
  } & EventProperties;
  appBackgrounded: {
    sessionDurationMs?: number;
  } & EventProperties;
  screenViewed: {
    screenName?: string;
    previousScreen?: string;
    durationMs?: number;
  } & EventProperties;
  featureUsed: {
    featureName?: string;
    screenName?: string;
    interactionType?: 'tap' | 'swipe' | 'longPress';
  } & EventProperties;
  settingsChanged: {
    settingName?: string;
    oldValue?: string;
    newValue?: string;
  } & EventProperties;
  notificationReceived: {
    type?: 'transaction' | 'security' | 'marketing' | 'system';
    opened?: boolean;
  } & EventProperties;
}

export interface ErrorEvents {
  errorOccurred: {
    errorType?: 'network' | 'validation' | 'authentication' | 'unknown';
    errorCode?: string;
    errorMessage?: string;
    screenName?: string;
    userAction?: string;
    stackTrace?: string;
  } & EventProperties;
  apiError: {
    endpoint?: string;
    statusCode?: number;
    errorMessage?: string;
    retryCount?: number;
  } & EventProperties;
  transactionError: {
    transactionType?: 'send' | 'receive' | 'swap' | 'stake';
    errorStage?: 'preparation' | 'signing' | 'broadcast' | 'confirmation';
    errorCode?: string;
    errorMessage?: string;
    gasLimit?: string;
    gasPrice?: string;
  } & EventProperties;
}

export type AllEvents = TransactionEvents & AuthEvents & AppEvents & ErrorEvents;

export type EventName = keyof AllEvents;
export type EventData<T extends EventName> = AllEvents[T];

export interface AnalyticsContext {
  userId?: string;
  sessionId?: string;
  deviceId?: string;
  platform?: 'ios' | 'android' | 'web' | 'extension';
  version?: string;
  environment?: 'development' | 'staging' | 'production';
}
