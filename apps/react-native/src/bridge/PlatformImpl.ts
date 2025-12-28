import { type Cache, type Navigation, type PlatformSpec, type Storage } from '@onflow/frw-context';
import type { NewKeyInfo } from '@onflow/frw-types';
import type {
  Currency,
  RecentContactsResponse,
  WalletAccount,
  WalletAccountsResponse,
  WalletProfilesResponse,
} from '@onflow/frw-types';
import { Platform } from '@onflow/frw-types';
import { extractUidFromJwt, isTransactionId } from '@onflow/frw-utils';
// import { GAS_LIMITS } from '@onflow/frw-workflow';
import { Buffer } from 'buffer';
import Instabug from 'instabug-reactnative';
import { Platform as RNPlatform } from 'react-native';

import { cache, storage } from '../storage';
import NativeFRWBridge from './NativeFRWBridge';
import { reactNativeNavigation } from './ReactNativeNavigation';
import { createBridgeAuthorization, createPayer, createProposer } from './signWithRole';

const CONSOLE_STYLES: Record<'debug' | 'info' | 'warn' | 'error', string> = {
  debug: 'background:#16FF99;color:#000000;padding:0 4px;border-radius:2px;',
  info: 'background:#2563eb;color:#f8fafc;padding:0 4px;border-radius:2px;',
  warn: 'background:#d97706;color:#fff7ed;padding:0 4px;border-radius:2px;',
  error: 'background:#dc2626;color:#fef2f2;padding:0 4px;border-radius:2px;',
};

const bytesToHex = (bytes: Uint8Array): string => Buffer.from(bytes).toString('hex');
const hexToBytes = (hex: string): Uint8Array =>
  new Uint8Array(Buffer.from(hex.startsWith('0x') ? hex.slice(2) : hex, 'hex'));

class PlatformImpl implements PlatformSpec {
  private debugMode: boolean = __DEV__;
  private instabugInitialized: boolean = false;

  log(level: 'debug' | 'info' | 'warn' | 'error' = 'debug', message: string, ...args: any[]): void {
    if (level === 'debug' && !this.debugMode) {
      return;
    }

    const prefix = `[FRW-${level.toUpperCase()}]`;
    const fullMessage = args.length > 0 ? `${message} ${args.join(' ')}` : message;
    const formattedPrefix = `%c${prefix}`;
    const styleArgs = [CONSOLE_STYLES[level]];

    // Use native bridge for additional logging
    try {
      // Convert all args to strings for native bridge compatibility
      const stringArgs = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      );
      NativeFRWBridge.logToNative(level, message, stringArgs);
    } catch (error) {
      // Silently fail - don't use console here to avoid recursion
    }

    // Console logging for development - always use console directly
    switch (level) {
      case 'debug':
        // eslint-disable-next-line no-console
        console.log(formattedPrefix, ...styleArgs, message, ...args);
        break;
      case 'info':
        // eslint-disable-next-line no-console
        console.info(formattedPrefix, ...styleArgs, message, ...args);
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(formattedPrefix, ...styleArgs, message, ...args);
        break;
      case 'error':
        // eslint-disable-next-line no-console
        console.error(formattedPrefix, ...styleArgs, message, ...args);
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

  isInstabugInitialized(): boolean {
    return this.instabugInitialized;
  }

  isDebug(): boolean {
    return this.debugMode;
  }

  getSelectedAddress(): string | null {
    return NativeFRWBridge.getSelectedAddress();
  }

  getDebugAddress(): string | null {
    return NativeFRWBridge.getDebugAddress();
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

  async getCurrentUserUid(): Promise<string | null> {
    try {
      if (typeof NativeFRWBridge.getCurrentUserUid === 'function') {
        return (await NativeFRWBridge.getCurrentUserUid()) ?? null;
      }

      const token = await this.getJWT();
      return extractUidFromJwt(token) ?? null;
    } catch (error) {
      this.log('warn', '[PlatformImpl] Failed to resolve current user uid', error);
      return null;
    }
  }

  getVersion(): string {
    return NativeFRWBridge.getVersion();
  }

  getBuildNumber(): string {
    return NativeFRWBridge.getBuildNumber();
  }

  getLanguage(): string {
    try {
      // Get language from native bridge
      const language = NativeFRWBridge.getLanguage();

      // Validate the language is supported
      const supportedLanguages = ['en', 'es', 'zh', 'ru', 'jp'];
      return supportedLanguages.includes(language) ? language : 'en';
    } catch (error) {
      this.log(
        'warn',
        '[PlatformImpl] Failed to get language from native bridge, falling back to en:',
        error
      );
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

  async ethSign(signData: Uint8Array): Promise<Uint8Array> {
    if (!(signData instanceof Uint8Array)) {
      throw new Error('signData must be a Uint8Array');
    }

    const hexPayload = `0x${bytesToHex(signData)}`;
    const signatureHex = await NativeFRWBridge.ethSign(hexPayload);
    return hexToBytes(signatureHex);
  }

  scanQRCode(): Promise<string> {
    return NativeFRWBridge.scanQRCode();
  }

  createSeedKey(strength: number): Promise<NewKeyInfo> {
    return NativeFRWBridge.createSeedKey(strength);
  }

  saveNewKey(key: NewKeyInfo): Promise<void> {
    return NativeFRWBridge.saveNewKey(key);
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

    // Create signing context for signWithRole functions
    const signingContext = {
      getSelectedAccount: () => this.getSelectedAccount(),
      getSignKeyIndex: () => this.getSignKeyIndex(),
      sign: (hexData: string) => this.sign(hexData),
      getNetwork: () => this.getNetwork(),
    };

    // Create signing functions
    const proposer = createProposer(signingContext);
    const payer = createPayer(signingContext);
    const bridgeAuthorization = createBridgeAuthorization(signingContext);

    // Add version and platform headers to transactions
    cadenceService.useRequestInterceptor(async (config: any) => {
      if (config.type === 'transaction') {
        const platform = RNPlatform.OS;
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
