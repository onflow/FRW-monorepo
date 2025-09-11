/**
 * WalletUtils - Utility functions for wallet operations
 * Matches iOS WalletTypeUtils and additional wallet utilities
 */

import { type FlowAccount, type EVMAccount } from '../types/account';
import { type KeyProtocol } from '../types/key';
import { type WalletType } from '../types/wallet';

/**
 * Utility functions for wallet type operations
 */
export class WalletTypeUtils {
  /**
   * Get unique identifier for wallet type
   */
  static getId(walletType: WalletType): string {
    switch (walletType.type) {
      case 'key':
        // Generate ID from key type and some key properties
        return `key_${walletType.key.keyType}_${Date.now()}`;
      case 'watch':
        return `watch_${walletType.address}`;
      default:
        throw new Error(`Unknown wallet type: ${(walletType as any).type}`);
    }
  }

  /**
   * Get associated key from wallet type
   */
  static getKey(walletType: WalletType): KeyProtocol | null {
    return walletType.type === 'key' ? walletType.key : null;
  }

  /**
   * Check if wallet is key-based
   */
  static isKeyBased(walletType: WalletType): boolean {
    return walletType.type === 'key';
  }

  /**
   * Check if wallet is watch-only
   */
  static isWatchOnly(walletType: WalletType): boolean {
    return walletType.type === 'watch';
  }

  /**
   * Check if wallet can sign transactions
   */
  static canSign(walletType: WalletType): boolean {
    return walletType.type === 'key';
  }
}

/**
 * General wallet utility functions
 */
export class WalletUtils {
  /**
   * Validate Flow address format
   */
  static isValidFlowAddress(address: string): boolean {
    // Flow address validation: starts with 0x, followed by 16 hex chars
    const flowAddressRegex = /^0x[a-fA-F0-9]{16}$/;
    return flowAddressRegex.test(address);
  }

  /**
   * Validate EVM address format
   */
  static isValidEVMAddress(address: string): boolean {
    // EVM address validation: starts with 0x, followed by 40 hex chars
    const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return evmAddressRegex.test(address);
  }

  /**
   * Format address for display (truncate middle)
   */
  static formatAddress(address: string, startLength: number = 6, endLength: number = 4): string {
    if (address.length <= startLength + endLength) {
      return address;
    }
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
  }

  /**
   * Check if account is a Flow account
   */
  static isFlowAccount(account: FlowAccount | EVMAccount): account is FlowAccount {
    return 'keyIndex' in account;
  }

  /**
   * Check if account is an EVM account
   */
  static isEVMAccount(account: FlowAccount | EVMAccount): account is EVMAccount {
    return 'balance' in account && 'nonce' in account;
  }

  /**
   * Generate account display name
   */
  static generateAccountDisplayName(account: FlowAccount | EVMAccount, index?: number): string {
    if (account.name) {
      return account.name;
    }

    const accountType = this.isFlowAccount(account) ? 'Flow' : 'EVM';
    const indexSuffix = index !== undefined ? ` ${index + 1}` : '';

    return `${accountType} Account${indexSuffix}`;
  }

  /**
   * Sort accounts by creation order or name
   */
  static sortAccounts(accounts: (FlowAccount | EVMAccount)[]): (FlowAccount | EVMAccount)[] {
    return [...accounts].sort((a, b) => {
      // Sort by name if both have names
      if (a.name && b.name) {
        return a.name.localeCompare(b.name);
      }

      // If only one has a name, prioritize it
      if (a.name && !b.name) return -1;
      if (!a.name && b.name) return 1;

      // Sort by address as fallback
      return a.address.localeCompare(b.address);
    });
  }
}
