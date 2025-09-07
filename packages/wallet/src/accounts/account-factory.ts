/**
 * Account factory for creating account instances
 * Based on Flow Wallet Kit iOS account creation patterns
 */

import { type BaseAccount } from './base-account';
import { EVMAccount } from './evm-account';
import { FlowAccount } from './flow-account';
import {
  type FlowAccountData,
  type EVMAccountData,
  type CreateAccountParams,
} from '../types/account';
import { Chain } from '../types/chain';
import { AccountError } from '../types/errors';
import { NetworkUtils } from '../types/network';
import { type SecureStorage, type CacheStorage } from '../types/storage';

/**
 * Factory class for creating account instances
 */
export class AccountFactory {
  constructor(
    private secureStorage: SecureStorage,
    private cacheStorage: CacheStorage
  ) {}

  /**
   * Create account instance from account data
   */
  createAccount(accountData: FlowAccountData | EVMAccountData, walletId: string): BaseAccount {
    switch (accountData.chain) {
      case Chain.Flow:
        return new FlowAccount(
          accountData as FlowAccountData,
          walletId,
          this.secureStorage,
          this.cacheStorage
        );

      case Chain.EVM:
        return new EVMAccount(
          accountData as EVMAccountData,
          walletId,
          this.secureStorage,
          this.cacheStorage
        );

      default: {
        const exhaustiveCheck: never = accountData;
        throw AccountError.invalidAddress((accountData as any).address, {
          reason: `Unsupported chain: ${(accountData as any).chain}`,
        });
      }
    }
  }

  /**
   * Create Flow account
   */
  createFlowAccount(
    params: CreateAccountParams & { chain: Chain.Flow },
    walletId: string,
    additionalData?: Partial<FlowAccountData>
  ): FlowAccount {
    const accountData: FlowAccountData = {
      address: params.address,
      chain: Chain.Flow,
      network: params.network,
      keyIndex: params.keyIndex,
      name: params.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...additionalData,
    };

    return new FlowAccount(accountData, walletId, this.secureStorage, this.cacheStorage);
  }

  /**
   * Create EVM account
   */
  createEVMAccount(
    params: CreateAccountParams & { chain: Chain.EVM },
    walletId: string,
    additionalData?: Partial<EVMAccountData>
  ): EVMAccount {
    const accountData: EVMAccountData = {
      address: params.address,
      chain: Chain.EVM,
      network: params.network,
      keyIndex: params.keyIndex,
      name: params.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...additionalData,
    };

    return new EVMAccount(accountData, walletId, this.secureStorage, this.cacheStorage);
  }

  /**
   * Create watch-only Flow account
   */
  createWatchOnlyFlowAccount(
    address: string,
    network: string,
    walletId: string,
    name?: string
  ): FlowAccount {
    return this.createFlowAccount(
      {
        address,
        chain: Chain.Flow,
        network,
        name,
        // keyIndex is undefined for watch-only accounts
      },
      walletId
    );
  }

  /**
   * Create watch-only EVM account
   */
  createWatchOnlyEVMAccount(
    address: string,
    network: string,
    walletId: string,
    name?: string
  ): EVMAccount {
    return this.createEVMAccount(
      {
        address,
        chain: Chain.EVM,
        network,
        name,
        // keyIndex is undefined for watch-only accounts
      },
      walletId
    );
  }

  /**
   * Create account from derived key
   */
  async createDerivedAccount(
    chain: Chain,
    network: string,
    keyIndex: number,
    walletId: string,
    name?: string
  ): Promise<BaseAccount> {
    // This would derive the address from the key index
    // For now, throw not implemented error
    throw new Error('Derived account creation not yet implemented - requires key derivation');
  }

  /**
   * Restore account from cache
   */
  async restoreFromCache(
    address: string,
    chain: Chain,
    network: string,
    walletId: string
  ): Promise<BaseAccount | null> {
    try {
      const cacheKey = `account:${network}:${address}`;
      const cachedData = await this.cacheStorage.get(cacheKey);

      if (!cachedData) {
        return null;
      }

      // Add chain info if not present
      const accountData = {
        ...cachedData,
        chain,
      };

      return this.createAccount(accountData, walletId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate account parameters
   */
  validateAccountParams(params: CreateAccountParams): void {
    if (!params.address || !params.network) {
      throw AccountError.invalidAddress(params.address, {
        reason: 'Address and network are required',
      });
    }

    // Chain-specific validation would go here
  }

  /**
   * Get supported chains
   */
  static getSupportedChains(): Chain[] {
    return [Chain.Flow, Chain.EVM];
  }

  /**
   * Get supported networks for a chain
   */
  static getSupportedNetworks(chain: Chain): string[] {
    return NetworkUtils.getSupportedNetworkNames(chain);
  }

  /**
   * Check if chain and network combination is supported
   */
  static isNetworkSupported(chain: Chain, network: string): boolean {
    return NetworkUtils.isNetworkSupported(network);
  }
}
