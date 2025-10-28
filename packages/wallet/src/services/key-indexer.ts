/**
 * Key Indexer Service - 1:1 match to iOS Network.swift
 * Handles Flow blockchain account discovery via key indexer service
 */

import { WalletError } from '../types/errors';
import { FlowChainID, SignatureAlgorithm, HashAlgorithm } from '../types/key';

/**
 * Response structure from the Flow key indexer service - matches iOS KeyIndexerResponse
 */
export interface KeyIndexerResponse {
  publicKey: string;
  accounts: PublicKeyAccount[];
}

/**
 * Account entry in the key indexer response - matches iOS KeyIndexerResponse.Account
 */
export interface PublicKeyAccount {
  address: string;
  keyId: number;
  weight: number;
  sigAlgo: number;
  hashAlgo: number;
  signing: SignatureAlgorithm;
  hashing: HashAlgorithm;
  isRevoked: boolean;
}

/**
 * Flow account key structure - matches iOS Flow.AccountKey
 */
export interface FlowAccountKey {
  index: number;
  publicKey: {
    hex: string;
  };
  signAlgo: SignatureAlgorithm;
  hashAlgo: HashAlgorithm;
  weight: number;
  revoked: boolean;
}

/**
 * Flow account structure - matches iOS Flow.Account
 */
export interface FlowAccountData {
  address: {
    hex: string;
  };
  keys: FlowAccountKey[];
}

/**
 * Key indexer service implementation - matches iOS Network class
 */
export class KeyIndexerService {
  /**
   * Get key indexer URL for a specific public key and chain - matches iOS Flow.ChainID.keyIndexer
   */
  private static getKeyIndexerUrl(publicKey: string, chainId: FlowChainID): string | null {
    switch (chainId) {
      case FlowChainID.Mainnet:
        return `https://production.key-indexer.flow.com/key/${publicKey}`;
      case FlowChainID.Testnet:
        return `https://staging.key-indexer.flow.com/key/${publicKey}`;
      default:
        return null;
    }
  }

  /**
   * Find account information using the key indexer service - matches iOS Network.findAccount
   * @param publicKey The public key to search for
   * @param chainId The Flow network to search on
   * @returns Key indexer response containing account information
   * @throws Error if the request fails
   */
  static async findAccount(publicKey: string, chainId: FlowChainID): Promise<KeyIndexerResponse> {
    const url = this.getKeyIndexerUrl(publicKey, chainId);
    if (!url) {
      throw WalletError.UnsupportedNetwork({ details: { chainId } });
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'FlowWalletKit-TypeScript/1.0',
        },
      });

      if (!response.ok) {
        throw WalletError.AccountDiscoveryFailed({
          details: {
            status: response.status,
            url,
            chainId,
          },
        });
      }

      const data = await response.json();
      return this.parseKeyIndexerResponse(data, publicKey);
    } catch (error) {
      if (error instanceof WalletError) {
        throw error;
      }
      if (error instanceof Error) {
        throw WalletError.AccountDiscoveryFailed({
          cause: error,
          details: { url, chainId },
        });
      }
      throw WalletError.AccountDiscoveryFailed({ details: { url, chainId } });
    }
  }

  /**
   * Parse and validate key indexer response
   */
  private static parseKeyIndexerResponse(data: any, publicKey: string): KeyIndexerResponse {
    // Handle different response formats
    let accounts: any[] = [];

    if (Array.isArray(data)) {
      accounts = data;
    } else if (data.accounts && Array.isArray(data.accounts)) {
      accounts = data.accounts;
    } else if (data.result && Array.isArray(data.result)) {
      accounts = data.result;
    } else {
      throw WalletError.AccountDiscoveryFailed({
        details: { reason: 'invalid_response_format' },
      });
    }

    const parsedAccounts: PublicKeyAccount[] = accounts.map((account: any) => ({
      address: account.address || account.accountAddress || '',
      keyId: account.keyId || account.keyIndex || account.key_id || 0,
      weight: account.weight || 1000,
      sigAlgo: account.sigAlgo || account.signatureAlgorithm || account.sig_algo || 1,
      hashAlgo: account.hashAlgo || account.hashAlgorithm || account.hash_algo || 1,
      signing: this.mapSignatureAlgorithm(
        account.sigAlgo || account.signatureAlgorithm || account.sig_algo || 1
      ),
      hashing: this.mapHashAlgorithm(
        account.hashAlgo || account.hashAlgorithm || account.hash_algo || 1
      ),
      isRevoked: account.isRevoked || account.revoked || false,
    }));

    return {
      publicKey,
      accounts: parsedAccounts,
    };
  }

  /**
   * Map signature algorithm number to enum - matches iOS SignatureAlgorithm mapping
   */
  private static mapSignatureAlgorithm(sigAlgo: number): SignatureAlgorithm {
    switch (sigAlgo) {
      case 1:
        return SignatureAlgorithm.ECDSA_P256;
      case 2:
        return SignatureAlgorithm.ECDSA_secp256k1;
      default:
        return SignatureAlgorithm.ECDSA_P256; // Default fallback
    }
  }

  /**
   * Map hash algorithm number to enum - matches iOS HashAlgorithm mapping
   */
  private static mapHashAlgorithm(hashAlgo: number): HashAlgorithm {
    switch (hashAlgo) {
      case 1:
        return HashAlgorithm.SHA2_256;
      case 3:
        return HashAlgorithm.SHA3_256;
      default:
        return HashAlgorithm.SHA2_256; // Default fallback
    }
  }

  /**
   * Find accounts associated with a public key - matches iOS Network.findAccountByKey
   * @param publicKey The public key to search for
   * @param chainId The Flow network to search on
   * @returns Array of accounts associated with the key
   */
  static async findAccountByKey(
    publicKey: string,
    chainId: FlowChainID
  ): Promise<PublicKeyAccount[]> {
    const response = await this.findAccount(publicKey, chainId);
    return response.accounts;
  }

  /**
   * Find Flow accounts associated with a public key - matches iOS Network.findFlowAccountByKey
   * Converts the key indexer response to Flow account objects
   * This transformation aggregates keys by account address
   * @param publicKey The public key to search for
   * @param chainId The Flow network to search on
   * @returns Array of Flow accounts associated with the key
   */
  static async findFlowAccountByKey(
    publicKey: string,
    chainId: FlowChainID
  ): Promise<FlowAccountData[]> {
    const response = await this.findAccount(publicKey, chainId);
    return this.convertToFlowAccounts(response);
  }

  /**
   * Converts the key indexer response to Flow account objects - matches iOS KeyIndexerResponse.accountResponse
   * This transformation aggregates keys by account address
   */
  private static convertToFlowAccounts(response: KeyIndexerResponse): FlowAccountData[] {
    const accountsMap = new Map<string, FlowAccountData>();

    for (const account of response.accounts) {
      const address = account.address;

      if (accountsMap.has(address)) {
        // Add key to existing account
        const existingAccount = accountsMap.get(address)!;
        existingAccount.keys.push({
          index: account.keyId,
          publicKey: { hex: response.publicKey },
          signAlgo: account.signing,
          hashAlgo: account.hashing,
          weight: account.weight,
          revoked: account.isRevoked,
        });
      } else {
        // Create new account with first key
        accountsMap.set(address, {
          address: { hex: address },
          keys: [
            {
              index: account.keyId,
              publicKey: { hex: response.publicKey },
              signAlgo: account.signing,
              hashAlgo: account.hashing,
              weight: account.weight,
              revoked: account.isRevoked,
            },
          ],
        });
      }
    }

    return Array.from(accountsMap.values());
  }

  /**
   * Check if a public key has any associated accounts on the given network
   * @param publicKey The public key to check
   * @param chainId The Flow network to search on
   * @returns Boolean indicating if accounts were found
   */
  static async hasAccounts(publicKey: string, chainId: FlowChainID): Promise<boolean> {
    try {
      const accounts = await this.findAccountByKey(publicKey, chainId);
      return accounts.length > 0;
    } catch (error) {
      console.warn(`Failed to check accounts for public key: ${error}`);
      return false;
    }
  }

  /**
   * Filter accounts by weight threshold - matches iOS full weight key logic
   * @param accounts Array of accounts to filter
   * @param minWeight Minimum weight threshold (default: 1000 for full weight)
   * @returns Filtered accounts meeting the weight requirement
   */
  static filterByWeight(
    accounts: PublicKeyAccount[],
    minWeight: number = 1000
  ): PublicKeyAccount[] {
    return accounts.filter((account) => !account.isRevoked && account.weight >= minWeight);
  }
}
