/**
 * Wallet types - data models only (exact match to Flow Wallet Kit iOS)
 */

import { type KeyProtocol, type FlowAddress } from './key';

// Re-export from key types
export { FlowChainID as ChainID, type FlowAddress } from './key';

/**
 * Wallet type discriminated union - exact match to iOS WalletType.swift
 */
export type WalletType =
  | { type: 'key'; key: KeyProtocol }
  | { type: 'watch'; address: FlowAddress };

/**
 * Wallet type operations - matches iOS WalletTypeProtocol
 */
interface WalletTypeOperations {
  idPrefix: string;
  id: string;
  key?: KeyProtocol;
}

/**
 * Wallet type utilities - matches iOS extension methods
 */
export class WalletTypeUtils {
  private static readonly ID_PREFIX = 'frw';

  static getId(walletType: WalletType): string {
    const operations = this.getOperations(walletType);
    return operations.id;
  }

  static getKey(walletType: WalletType): KeyProtocol | null {
    const operations = this.getOperations(walletType);
    return operations.key || null;
  }

  static canSign(walletType: WalletType): boolean {
    return walletType.type === 'key';
  }

  private static getOperations(walletType: WalletType): WalletTypeOperations {
    switch (walletType.type) {
      case 'key':
        return {
          idPrefix: this.ID_PREFIX,
          id: `${this.ID_PREFIX}/${walletType.key.keyType}`,
          key: walletType.key,
        };
      case 'watch':
        return {
          idPrefix: this.ID_PREFIX,
          id: `${this.ID_PREFIX}/${walletType.address}`,
        };
    }
  }
}
