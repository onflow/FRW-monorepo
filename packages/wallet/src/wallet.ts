/**
 * Wallet class - exact match to Flow Wallet Kit iOS Wallet.swift
 */

import { Account } from './account';
import { MemoryStorage } from './storage/memory-storage';
import {
  type KeyProtocol,
  type StorageProtocol,
  type SecurityCheckDelegate,
  FlowChainID,
  type FlowAddress,
  type FlowAccount,
} from './types/key';
import { type WalletType, WalletTypeUtils } from './types/wallet';

/**
 * Wallet class - exact match to Flow Wallet Kit iOS Wallet.swift
 */
export class Wallet {
  readonly type: WalletType;
  networks: Set<FlowChainID>;
  public securityDelegate?: SecurityCheckDelegate;

  // Private state properties
  private accounts: Map<FlowChainID, Account[]> | null = null;
  private flowAccounts: Map<FlowChainID, FlowAccount[]> | null = null;
  private isLoading: boolean = false;
  private cacheStorage: StorageProtocol;

  constructor(
    type: WalletType,
    networks: Set<FlowChainID> = new Set([FlowChainID.Mainnet, FlowChainID.Testnet]),
    cacheStorage?: StorageProtocol
  ) {
    this.type = type;
    this.networks = networks;
    this.cacheStorage = cacheStorage || new MemoryStorage();
  }

  /**
   * Get wallet unique identifier
   */
  get id(): string {
    return WalletTypeUtils.getId(this.type);
  }

  /**
   * Check if wallet can sign transactions
   */
  get canSign(): boolean {
    return WalletTypeUtils.canSign(this.type);
  }

  /**
   * Get associated key if available
   */
  get key(): KeyProtocol | null {
    return WalletTypeUtils.getKey(this.type);
  }

  /**
   * Fetch Flow accounts for all networks - matches iOS fetchAccount()
   */
  async fetchAccount(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    try {
      await this.fetchAllNetworkAccounts();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Fetch accounts for all supported networks
   */
  async fetchAllNetworkAccounts(): Promise<Map<FlowChainID, Account[]>> {
    const allAccounts = new Map<FlowChainID, Account[]>();

    for (const network of this.networks) {
      const accounts = await this.account(network);
      const accountInstances = accounts.map(
        (flowAccount) => new Account(flowAccount, network, this.key || undefined)
      );
      allAccounts.set(network, accountInstances);
    }

    this.accounts = allAccounts;
    return allAccounts;
  }

  /**
   * Get Flow accounts for specific network
   */
  async account(chainID: FlowChainID): Promise<FlowAccount[]> {
    // Implementation would fetch from Flow blockchain
    // This is a placeholder matching the iOS interface
    throw new Error('account() not implemented - requires Flow blockchain integration');
  }

  /**
   * Get account instance by address and network
   */
  getAccount(address: FlowAddress, network: FlowChainID): Account | null {
    const networkAccounts = this.accounts?.get(network);
    if (!networkAccounts) return null;

    return networkAccounts.find((acc) => acc.account.address === address) || null;
  }

  /**
   * Add new network to wallet
   */
  addNetwork(network: FlowChainID): void {
    this.networks.add(network);
  }
}

/**
 * Wallet factory for creating different wallet types
 */
export class WalletFactory {
  /**
   * Create wallet from key
   */
  static fromKey(
    key: KeyProtocol,
    networks?: Set<FlowChainID>,
    cacheStorage?: StorageProtocol
  ): Wallet {
    const wallet = new Wallet({ type: 'key', key }, networks, cacheStorage);
    return wallet;
  }

  /**
   * Create watch-only wallet from address
   */
  static watchOnly(
    address: FlowAddress,
    networks?: Set<FlowChainID>,
    cacheStorage?: StorageProtocol
  ): Wallet {
    return new Wallet({ type: 'watch', address }, networks, cacheStorage);
  }
}
