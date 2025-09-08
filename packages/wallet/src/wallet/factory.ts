/**
 * WalletFactory - Factory class for creating wallets
 * Matches iOS WalletFactory patterns
 */

import { Wallet } from './wallet';
import {
  type KeyProtocol,
  type StorageProtocol,
  type FlowChainID,
  type FlowAddress,
} from '../types/key';


/**
 * Factory class for creating different types of wallets
 */
export class WalletFactory {
  /**
   * Create a key-based wallet
   */
  static createKeyWallet(
    key: KeyProtocol,
    networks?: Set<FlowChainID>,
    cacheStorage?: StorageProtocol
  ): Wallet {
    return new Wallet({ type: 'key', key }, networks, cacheStorage);
  }

  /**
   * Create a watch-only wallet
   */
  static createWatchWallet(
    address: FlowAddress,
    networks?: Set<FlowChainID>,
    cacheStorage?: StorageProtocol
  ): Wallet {
    return new Wallet({ type: 'watch', address }, networks, cacheStorage);
  }

  /**
   * Create wallet from existing wallet type
   */
  static createFromType(
    walletType: { type: 'key'; key: KeyProtocol } | { type: 'watch'; address: FlowAddress },
    networks?: Set<FlowChainID>,
    cacheStorage?: StorageProtocol
  ): Wallet {
    return new Wallet(walletType, networks, cacheStorage);
  }
}
