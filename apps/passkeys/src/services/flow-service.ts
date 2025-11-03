import { p256 } from '@noble/curves/nist.js';
import { CadenceService, configureFCL, fcl } from '@onflow/frw-cadence';
import { logger } from '@onflow/frw-utils';

import { type KeyInfo } from './passkey-service';

export interface FlowAccount {
  address: string;
  balance: string;
  keys: Array<{
    index: number;
    publicKey: string;
    signAlgo: number;
    hashAlgo: number;
    weight: number;
    sequenceNumber: number;
    revoked: boolean;
  }>;
}

export class FlowService {
  private static initialized = false;
  private static cadenceService: CadenceService | null = null;
  private static currentNetwork: 'testnet' | 'mainnet' = 'testnet';

  /**
   * Initialize FCL configuration
   */
  static async initialize(network: 'testnet' | 'mainnet' = 'testnet') {
    if (this.initialized && this.currentNetwork === network) return;

    configureFCL(network);

    if (!this.cadenceService) {
      this.cadenceService = new CadenceService();
    }

    this.currentNetwork = network;
    this.initialized = true;
    logger.info('FlowService initialized', { network });
  }

  /**
   * Create a new Flow address with the given public key
   */
  static async createAddress(
    publicKey: string,
    networkOverride?: 'testnet' | 'mainnet'
  ): Promise<{ success: boolean; txId?: string; address?: string; error?: string }> {
    try {
      const resolvedNetwork =
        networkOverride ??
        (process.env.NEXT_PUBLIC_FLOW_NETWORK === 'mainnet' ? 'mainnet' : 'testnet');

      const formattedPublicKey = this.formatPublicKeyForFlow(publicKey);

      const response = await fetch('/api/create-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicKey: formattedPublicKey,
          network: resolvedNetwork,
          hashAlgorithm: 'SHA2_256',
          signatureAlgorithm: 'ECDSA_P256',
          weight: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      let resolvedAddress = result.address as string | undefined;
      const txId = result.txId as string | undefined;

      if (!resolvedAddress && txId) {
        resolvedAddress = await this.waitForAccountCreation(
          txId,
          resolvedNetwork,
          formattedPublicKey
        );
      }

      if (!resolvedAddress) {
        const lookup = await this.findAddressByPublicKey(formattedPublicKey);
        if (lookup.success && lookup.addresses.length > 0) {
          resolvedAddress = lookup.addresses[0];
        }
      }

      return {
        ...result,
        address: resolvedAddress,
        txId,
      };
    } catch (error) {
      logger.error('Flow address creation failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Find existing Flow addresses by public key
   */
  static async findAddressByPublicKey(
    publicKey: string
  ): Promise<{ success: boolean; addresses: string[]; count: number; error?: string }> {
    try {
      const formattedKey = this.formatPublicKeyForFlow(publicKey);
      const response = await fetch(
        `/api/find-address?publicKey=${encodeURIComponent(formattedKey)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      logger.error('Flow address lookup failed', error);
      return {
        success: false,
        addresses: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Extract public key from passkey credential in hex format
   */
  static extractPublicKeyFromCredential(publicKey: ArrayBuffer): string {
    // Convert ArrayBuffer to hex string
    const bytes = new Uint8Array(publicKey);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return this.formatPublicKeyForFlow(hex);
  }

  /**
   * Convert hex public key to Flow-compatible format
   * Remove the 0x04 prefix if present (uncompressed key indicator)
   */
  static formatPublicKeyForFlow(hexPublicKey: string): string {
    // Remove 0x prefix if present
    if (hexPublicKey.startsWith('0x')) {
      hexPublicKey = hexPublicKey.slice(2);
    }

    let normalized = hexPublicKey.toLowerCase();

    // Remove uncompressed prefix if present
    if (normalized.startsWith('04') && normalized.length >= 130) {
      normalized = normalized.slice(2);
    }

    // Handle compressed keys (33 bytes, 66 hex chars)
    if (normalized.length === 66) {
      try {
        const point = p256.ProjectivePoint.fromHex(`0x${normalized}`);
        const uncompressed = point.toRawBytes(false).slice(1); // drop prefix
        normalized = Array.from(uncompressed)
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('');
      } catch (error) {
        logger.warn('Failed to decompress compressed public key', {
          error,
          publicKey: hexPublicKey,
        });
      }
    }

    if (normalized.length !== 128) {
      logger.warn('Unexpected Flow public key length after normalization', {
        length: normalized.length,
        publicKey: normalized,
      });
    }

    return normalized;
  }

  private static async waitForAccountCreation(
    txId: string,
    network: 'testnet' | 'mainnet',
    normalizedPublicKey?: string
  ): Promise<string | undefined> {
    try {
      await this.initialize(network);

      logger.info('Waiting for Flow transaction execution', { txId, network });
      const sealed = await this.waitForTransactionStatus(txId, 3);
      logger.info('Transaction reached desired status', {
        txId,
        status: sealed.status,
        statusString: sealed.statusString,
      });
      const events = sealed?.events ?? [];
      const address = events.find((event: any) => event.type === 'flow.AccountCreated')?.data
        ?.address;
      if (address) {
        logger.info('Flow account created (sealed)', { txId, address });
        return address;
      }

      logger.warn('Account creation event not found in transaction', { txId });

      if (normalizedPublicKey) {
        for (let attempt = 0; attempt < 5; attempt += 1) {
          const lookup = await this.findAddressByPublicKey(normalizedPublicKey);
          if (lookup.success && lookup.addresses.length > 0) {
            logger.info('Resolved Flow account via public key lookup after transaction sealed', {
              txId,
              address: lookup.addresses[0],
              attempt,
            });
            return lookup.addresses[0];
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      return undefined;
    } catch (error) {
      logger.warn('Failed while waiting for Flow transaction sealing', {
        txId,
        error,
      });
      return undefined;
    }
  }

  private static async waitForTransactionStatus(txId: string, targetStatus: number): Promise<any> {
    const maxAttempts = 120;
    const pollIntervalMs = 1000;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const snapshot = await fcl.tx(txId).snapshot();
      const status = snapshot?.status ?? 0;
      const statusString = snapshot?.statusString ?? '';
      logger.debug('Transaction status poll', { txId, attempt, status, statusString });
      if (status >= targetStatus) {
        return snapshot;
      }
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
    throw new Error(`Timed out waiting for transaction ${txId} to reach status ${targetStatus}`);
  }

  /**
   * Get account information
   */
  static async getAccount(address: string): Promise<FlowAccount> {
    try {
      const account = await fcl.account(address);

      return {
        address: account.address,
        balance: account.balance.toString(),
        keys: account.keys.map((key: any) => ({
          index: key.index,
          publicKey: key.publicKey,
          signAlgo: key.signAlgo,
          hashAlgo: key.hashAlgo,
          weight: key.weight,
          sequenceNumber: key.sequenceNumber,
          revoked: key.revoked,
        })),
      };
    } catch (error) {
      logger.error('Failed to get account', error);
      throw new Error(`Failed to get Flow account: ${error}`);
    }
  }

  /**
   * Get Flow balance for an address
   */
  static async getBalance(address: string): Promise<string> {
    try {
      await this.initialize(this.currentNetwork);

      if (!this.cadenceService) {
        this.cadenceService = new CadenceService();
      }

      const accountInfo = await this.cadenceService.getAccountInfo(address);
      return accountInfo?.availableBalance ?? accountInfo?.balance ?? '0.0';
    } catch (error) {
      logger.error('Failed to get balance via CadenceService', error);
      throw new Error(`Failed to get Flow balance: ${error}`);
    }
  }

  /**
   * Send Flow tokens
   */
  static async sendFlow(
    fromAddress: string,
    toAddress: string,
    amount: string,
    keyInfo: KeyInfo
  ): Promise<string> {
    const sendFlowTx = `
      import FlowToken from 0x1654653399040a61
      import FungibleToken from 0x9a0766d93b6608b7

      transaction(amount: UFix64, to: Address) {
        let vault: @FungibleToken.Vault

        prepare(signer: AuthAccount) {
          let vaultRef = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow reference to the owner's Vault!")

          self.vault <- vaultRef.withdraw(amount: amount)
        }

        execute {
          let recipient = getAccount(to)
          let receiverRef = recipient.getCapability(/public/flowTokenReceiver)
            .borrow<&{FungibleToken.Receiver}>()
            ?? panic("Could not borrow receiver reference to the recipient's Vault")

          receiverRef.deposit(from: <-self.vault)
        }
      }
    `;

    try {
      const authz = fcl.authz;

      const txId = await fcl.mutate({
        cadence: sendFlowTx,
        args: (arg: any, t: any) => [arg(amount, t.UFix64), arg(toAddress, t.Address)],
        proposer: authz,
        payer: authz,
        authorizations: [authz],
        limit: 1000,
      });

      await fcl.tx(txId).onceSealed();
      return txId;
    } catch (error) {
      logger.error('Failed to send Flow', error);
      throw new Error(`Failed to send Flow tokens: ${error}`);
    }
  }

  /**
   * Sign transaction with passkey
   */
  static createAuthzWithPasskey(
    address: string,
    keyIndex: number,
    signFunction: (message: string) => Promise<string>
  ) {
    return (account: any = {}) => {
      return {
        ...account,
        tempId: `${address}-${keyIndex}`,
        addr: fcl.sansPrefix(address),
        keyId: keyIndex,
        signingFunction: async (signable: any) => {
          const message = signable.message;
          const signature = await signFunction(message);

          return {
            addr: fcl.sansPrefix(address),
            keyId: keyIndex,
            signature,
          };
        },
      };
    };
  }

  /**
   * Get current user (if authenticated)
   */
  static async getCurrentUser() {
    return await fcl.currentUser.snapshot();
  }

  /**
   * Sign user message
   */
  static async signUserMessage(message: string): Promise<string> {
    try {
      const MSG = Buffer.from(message).toString('hex');
      const signature = await fcl.currentUser.signUserMessage(MSG);
      return signature;
    } catch (error) {
      logger.error('Failed to sign user message', error);
      throw new Error(`Failed to sign message: ${error}`);
    }
  }

  /**
   * Verify user signature
   */
  static async verifyUserSignature(
    message: string,
    signature: string,
    address: string
  ): Promise<boolean> {
    try {
      const MSG = Buffer.from(message).toString('hex');
      const isValid = await fcl.AppUtils.verifyUserSignatures(MSG, signature);
      return isValid;
    } catch (error) {
      logger.error('Failed to verify signature', error);
      return false;
    }
  }
}
