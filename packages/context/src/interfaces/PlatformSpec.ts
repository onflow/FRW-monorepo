import type {
  Currency,
  Platform,
  RecentContactsResponse,
  WalletAccount,
  WalletAccountsResponse,
} from '@onflow/frw-types';

import type { Navigation } from './Navigation';
import type { Storage } from './Storage';

// Re-export CadenceService interceptor types
export type CadenceRequestInterceptor = (config: any) => any | Promise<any>;
export type CadenceResponseInterceptor = (response: any) => any | Promise<any>;

/**
 * Platform specification interface for platform abstraction
 * This interface defines all methods that platform-specific implementations must implement
 */
export interface PlatformSpec {
  // Basic platform methods
  getSelectedAddress(): string | null;
  getNetwork(): string;
  getJWT(): Promise<string>;
  getVersion(): string;
  getBuildNumber(): string;

  getCurrency(): Currency;
  getPlatform(): Platform;

  // API endpoint methods
  getApiEndpoint(): string;
  getGoApiEndpoint(): string;
  getInstabugToken(): string;

  // Storage and navigation access
  getStorage(): Storage;
  getNavigation(): Navigation;

  // Cryptographic operations
  // Turbo Modules do not support Uint8Array or ArrayBuffer, so we need to convert to hex string instead
  sign(hexData: string): Promise<string>;
  getSignKeyIndex(): number;

  // Data access methods
  getRecentContacts(): Promise<RecentContactsResponse>;
  getWalletAccounts(): Promise<WalletAccountsResponse>;
  getSelectedAccount(): Promise<WalletAccount>;
  
  // Get parent address for transaction proposer
  getParentAddress(): Promise<string | null>;
  
  // Token and account data methods
  getCoins(): Promise<any[] | null>;
  getAccountInfo(address: string): Promise<any>;
  
  // Transaction monitoring and post-transaction actions
  listenTransaction?(txId: string, showNotification: boolean, title: string, message: string, icon?: string): void;
  setRecent?(contact: any): Promise<void>;
  setDashIndex?(index: number): Promise<void>;

  // CadenceService configuration using interceptor pattern
  // This method allows the bridge to configure all FCL-related functionality
  configureCadenceService(cadenceService: any): void;

  // Logging methods - platform-specific logging implementation
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: unknown[]): void;
  isDebug(): boolean;

  // UI interaction methods
  scanQRCode(): Promise<string>;
  closeRN(id?: string | null): void;
}
