import { type Cache, type Navigation, type PlatformSpec, type Storage } from '@onflow/frw-context';
import type {
  Currency,
  RecentContactsResponse,
  WalletAccount,
  WalletAccountsResponse,
  WalletProfilesResponse,
} from '@onflow/frw-types';
import { Platform } from '@onflow/frw-types';
import { isTransactionId } from '@onflow/frw-utils';
// import { GAS_LIMITS } from '@onflow/frw-workflow';
import Instabug from 'instabug-reactnative';
import { NativeModules, Platform as RNPlatform } from 'react-native';

import { cache, storage } from '../storage';
import NativeFRWBridge from './NativeFRWBridge';
import { reactNativeNavigation } from './ReactNativeNavigation';
import { bridgeAuthorization, payer, proposer } from './signWithRole';

class PlatformImpl implements PlatformSpec {
  private debugMode: boolean = __DEV__;
  private instabugInitialized: boolean = false;

  log(level: 'debug' | 'info' | 'warn' | 'error' = 'debug', message: string, ...args: any[]): void {
    if (level === 'debug' && !this.debugMode) {
      return;
    }

    const prefix = `[FRW-${level.toUpperCase()}]`;
    const fullMessage = args.length > 0 ? `${message} ${args.join(' ')}` : message;

    // Console logging for development - always use console directly
    switch (level) {
      case 'debug':
        // eslint-disable-next-line no-console
        console.log(prefix, message, ...args);
        break;
      case 'info':
        // eslint-disable-next-line no-console
        console.info(prefix, message, ...args);
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        // eslint-disable-next-line no-console
        console.error(prefix, message, ...args);
        break;
    }

    // Instabug logging only if initialized
    if (this.instabugInitialized) {
      try {
        const instabugMessage = `${prefix} ${fullMessage}`;

        switch (level) {
          case 'debug':
            // Only send debug logs in debug mode to avoid spam
            if (this.debugMode) {
              Instabug.logDebug(instabugMessage);
            }
            break;
          case 'info':
            Instabug.logInfo(instabugMessage);
            break;
          case 'warn':
            Instabug.logWarn(instabugMessage);
            break;
          case 'error':
            Instabug.logError(instabugMessage);
            break;
        }
      } catch (error) {
        // Silently fail - don't use console.warn here to avoid recursion
      }
    }
  }

  setInstabugInitialized(initialized: boolean): void {
    this.instabugInitialized = initialized;
  }

  isDebug(): boolean {
    return this.debugMode;
  }

  getSelectedAddress(): string | null {
    return NativeFRWBridge.getSelectedAddress();
  }

  getWatchAddress(): string {
    return NativeFRWBridge.getWatchAddress();
  }

  getNetwork(): string {
    return NativeFRWBridge.getNetwork();
  }

  getJWT(): Promise<string> {
    return NativeFRWBridge.getJWT();
  }

  getSelectedAccount(): Promise<WalletAccount> {
    return NativeFRWBridge.getSelectedAccount();
  }

  getVersion(): string {
    return NativeFRWBridge.getVersion();
  }

  getBuildNumber(): string {
    return NativeFRWBridge.getBuildNumber();
  }

  getLanguage(): string {
    try {
      // Get language from system locale
      const locale =
        RNPlatform.OS === 'ios'
          ? NativeModules.SettingsManager?.settings?.AppleLocale ||
            NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
            'en'
          : NativeModules.I18nManager?.localeIdentifier || 'en';

      // Extract language code (e.g., 'en-US' -> 'en', 'zh-CN' -> 'zh')
      const languageCode = locale.split('-')[0].toLowerCase();

      // Validate against supported languages
      const supportedLanguages = ['en', 'es', 'zh', 'ru', 'jp'];
      return supportedLanguages.includes(languageCode) ? languageCode : 'en';
    } catch (error) {
      this.log('warn', '[PlatformImpl] Failed to get system language, falling back to en:', error);
      return 'en';
    }
  }

  getCurrency(): Currency {
    return NativeFRWBridge.getCurrency();
  }
  getPlatform(): Platform {
    return RNPlatform.OS === 'ios' ? Platform.iOS : Platform.Android;
  }

  getApiEndpoint(): string {
    const env = NativeFRWBridge.getEnv();
    return env.NODE_API_URL;
  }

  getGoApiEndpoint(): string {
    const env = NativeFRWBridge.getEnv();
    return env.GO_API_URL;
  }

  getInstabugToken(): string {
    try {
      const env = NativeFRWBridge.getEnv();
      return env.INSTABUG_TOKEN || '';
    } catch (error) {
      this.log('warn', '[PlatformImpl] Failed to get Instabug token from native bridge:', error);
      return '';
    }
  }

  storage(): Storage {
    return storage;
  }

  cache(): Cache {
    return cache;
  }

  sign(hexData: string): Promise<string> {
    return NativeFRWBridge.sign(hexData);
  }

  getRecentContacts(): Promise<RecentContactsResponse> {
    return NativeFRWBridge.getRecentContacts();
  }

  getWalletAccounts(): Promise<WalletAccountsResponse> {
    return NativeFRWBridge.getWalletAccounts();
  }

  getSignKeyIndex(): number {
    return NativeFRWBridge.getSignKeyIndex();
  }

  scanQRCode(): Promise<string> {
    return NativeFRWBridge.scanQRCode();
  }

  closeRN(): void {
    NativeFRWBridge.closeRN(null);
  }

  getWalletProfiles(): Promise<WalletProfilesResponse> {
    return NativeFRWBridge.getWalletProfiles();
  }

  configureCadenceService(cadenceService: any): void {
    const version = this.getVersion();
    const buildNumber = this.getBuildNumber();
    const network = this.getNetwork();

    // Add version and platform headers to transactions
    cadenceService.useRequestInterceptor(async (config: any) => {
      if (config.type === 'transaction') {
        const platform = 'react-native'; // Platform.OS is not available here
        const versionHeader = `// Flow Wallet - ${network} Script - ${config.name} - React Native - ${version}`;
        const platformHeader = `// Platform: ${platform} - ${version} - ${buildNumber}`;
        config.cadence = versionHeader + '\n' + platformHeader + '\n\n' + config.cadence;
      }
      return config;
    });

    // Configure gas limits
    cadenceService.useRequestInterceptor(async (config: any) => {
      if (config.type === 'transaction') {
        // config.limit = GAS_LIMITS.CADENCE_DEFAULT;
        config.limit = 9999;
        config.payer = payer;
        config.proposer = proposer;
      }
      return config;
    });

    // Configure authorizations
    cadenceService.useRequestInterceptor(async (config: any) => {
      if (config.type === 'transaction') {
        config.authorizations = [config.proposer];

        if (config.name.endsWith('WithPayer')) {
          config.authorizations = [config.proposer, bridgeAuthorization];
          // If the transaction is a bridge with payer transaction, use the bridge authorization as the payer
          config.payer = bridgeAuthorization;
        }
      }
      return config;
    });

    // Configure response interceptor
    cadenceService.useResponseInterceptor(async (config: any, response: any) => {
      if (config.type === 'transaction' && isTransactionId(response)) {
        NativeFRWBridge.listenTransaction(response);
      }
      return { config, response };
    });
  }

  navigation(): Navigation {
    // Return the navigation implementation - will be set up separately
    return reactNativeNavigation;
  }

  // Toast Manager implementation
  showToast(
    title: string,
    message?: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 4000
  ): void {
    try {
      NativeFRWBridge.showToast(title, message, type, duration);
    } catch (error) {
      this.log('error', '[PlatformImpl] Failed to show native toast via bridge:', error);
    }
  }

  hideToast(id: string): void {
    try {
      NativeFRWBridge.hideToast(id);
    } catch (error) {
      this.log('error', '[PlatformImpl] Failed to hide toast via bridge:', error);
    }
  }

  clearAllToasts(): void {
    try {
      NativeFRWBridge.clearAllToasts();
    } catch (error) {
      this.log('error', '[PlatformImpl] Failed to clear toasts via bridge:', error);
    }
  }
}

export const platform = new PlatformImpl();
