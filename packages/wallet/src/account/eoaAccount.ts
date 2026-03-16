/**
 * EOAAccount - a derived Ethereum account bound to a specific BIP44 index.
 * Wraps an EthereumKeyProtocol + index so callers can sign directly
 * without tracking which index maps to which address.
 *
 * Derivation path: m/44'/60'/0'/0/{index}
 */

import {
  type EthUnsignedTransaction,
  type EthSignedTransaction,
  type EthSignedMessage,
  type HexLike,
} from '../services/eth-signer';
import { type EthereumKeyProtocol } from '../types/key-protocol';

export class EOAAccount {
  /** BIP44 address index (last component of m/44'/60'/0'/0/{index}) */
  readonly index: number;

  /** EIP-55 checksummed Ethereum address */
  readonly address: string;

  private readonly key: EthereumKeyProtocol;

  constructor(key: EthereumKeyProtocol, index: number, address: string) {
    this.key = key;
    this.index = index;
    this.address = address;
  }

  /**
   * Return the raw 32-byte secp256k1 private key for this EOA.
   */
  async getPrivateKey(): Promise<Uint8Array> {
    return await this.key.ethPrivateKey(this.index);
  }

  /**
   * Return the uncompressed secp256k1 public key (65 bytes, 0x04-prefixed).
   */
  async getPublicKey(): Promise<Uint8Array> {
    return await this.key.ethPublicKey(this.index);
  }

  /**
   * Sign a 32-byte digest using secp256k1, returns [r|s|v].
   */
  async sign(digest: Uint8Array): Promise<Uint8Array> {
    return await this.key.ethSign(digest, this.index);
  }

  /**
   * Sign an Ethereum personal message (EIP-191).
   */
  async signPersonalMessage(message: HexLike): Promise<EthSignedMessage> {
    return await this.key.ethSignPersonalMessage(message, this.index);
  }

  /**
   * Sign an Ethereum transaction.
   */
  async signTransaction(transaction: EthUnsignedTransaction): Promise<EthSignedTransaction> {
    return await this.key.ethSignTransaction(transaction, this.index);
  }

  /**
   * Sign EIP-712 typed data.
   */
  async signTypedData(typedData: Record<string, unknown>): Promise<EthSignedMessage> {
    return await this.key.ethSignTypedData(typedData, this.index);
  }
}
