import { type PlatformSpec, type Storage } from '@onflow/frw-context';
import type {
  Currency,
  Platform,
  RecentContactsResponse,
  WalletAccount,
  WalletAccountsResponse,
} from '@onflow/frw-types';
import { isTransactionId } from '@onflow/frw-utils';
import { GAS_LIMITS } from '@onflow/frw-workflow';
import Instabug from 'instabug-reactnative';
import { Platform as RNPlatform } from 'react-native';
import { MMKV } from 'react-native-mmkv';

import NativeFRWBridge from './NativeFRWBridge';
import { bridgeAuthorization, payer, proposer } from './signWithRole';

class PlatformImpl implements PlatformSpec {
  private debugMode: boolean = __DEV__;

  log(level: 'debug' | 'info' | 'warn' | 'error' = 'debug', message: string, ...args: any[]): void {
    if (level === 'debug' && !this.debugMode) {
      return;
    }

    const prefix = `[FRW-${level.toUpperCase()}]`;
    const fullMessage = args.length > 0 ? `${message} ${args.join(' ')}` : message;

    // Console logging for development
    switch (level) {
      case 'debug':
        console.log(prefix, message, ...args);
        break;
      case 'info':
        console.info(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        break;
    }

    // Instabug logging for all environments
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
      // Fallback to console if Instabug fails (e.g., not initialized yet)

      console.warn('[PlatformImpl] Failed to log to Instabug:', error);
    }
  }

  isDebug(): boolean {
    return this.debugMode;
  }

  getSelectedAddress(): string | null {
    return NativeFRWBridge.getSelectedAddress();
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
    const env = NativeFRWBridge.getEnv();
    return env.INSTABUG_TOKEN;
  }

  getStorage(): Storage {
    return storage;
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
        config.limit = GAS_LIMITS.CADENCE_DEFAULT;
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

  getNavigation() {
    // Return the navigation implementation - will be set up separately
    return require('./ReactNativeNavigation').reactNativeNavigation;
  }
}

export const storage = new MMKV();
export const platform = new PlatformImpl();
