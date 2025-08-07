/**
 * Extension implementation of PlatformSpec
 * This is a mock implementation for testing UI components
 */

import {
  type PlatformSpec,
  type PlatformInfo,
  PlatformType,
  type Storage,
} from '@onflow/frw-context';
import type { RecentContactsResponse, WalletAccountsResponse } from '@onflow/frw-types';

import { useWallet } from '@/ui/hooks/use-wallet';

class ExtensionStorage implements Storage {
  // Mock storage implementation
  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }

  async getAllKeys(): Promise<string[]> {
    return Object.keys(localStorage);
  }
}

export class ExtensionPlatformSpec implements PlatformSpec {
  private wallet: any;

  constructor(wallet: any) {
    this.wallet = wallet;
  }

  getPlatformInfo(): PlatformInfo {
    return {
      type: PlatformType.CHROME_EXTENSION,
      isReactNative: false,
      isExtension: true,
      isWeb: false,
      isMobile: false,
    };
  }

  getSelectedAddress(): string | null {
    // Mock implementation - get from wallet if available
    try {
      return '0x1234567890abcdef'; // Mock address
    } catch {
      return null;
    }
  }

  getNetwork(): string {
    return 'mainnet'; // Mock network
  }

  async getJWT(): Promise<string> {
    return 'mock-jwt-token';
  }

  getVersion(): string {
    return '1.0.0';
  }

  getBuildNumber(): string {
    return '1';
  }

  getApiEndpoint(): string {
    return 'https://api.flowns.org';
  }

  getGoApiEndpoint(): string {
    return 'https://rest-mainnet.onflow.org';
  }

  getInstabugToken(): string {
    return '';
  }

  getStorage(): Storage {
    return new ExtensionStorage();
  }

  async sign(hexData: string): Promise<string> {
    // Mock signing implementation
    return `signed-${hexData}`;
  }

  getSignKeyIndex(): number {
    return 0;
  }

  async getRecentContacts(): Promise<RecentContactsResponse> {
    return {
      contacts: [],
    };
  }

  async getWalletAccounts(): Promise<WalletAccountsResponse> {
    return {
      accounts: [],
    };
  }

  configureCadenceService(cadenceService: any): void {
    // Mock configuration
    console.log('Configuring Cadence service for Extension', cadenceService);
  }

  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: unknown[]): void {
    console[level](`[Extension] ${message}`, ...args);
  }

  isDebug(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  async scanQRCode(): Promise<string> {
    throw new Error('QR scanning not implemented in extension');
  }

  closeRN(): void {
    // No-op for extension
  }
}

// Hook to create Extension platform spec
export function useExtensionPlatformSpec(): ExtensionPlatformSpec {
  const wallet = useWallet();
  return new ExtensionPlatformSpec(wallet);
}
