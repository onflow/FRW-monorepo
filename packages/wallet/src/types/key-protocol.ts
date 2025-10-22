/**
 * Key protocol interface - exact match to iOS Flow Wallet Kit KeyProtocol.swift
 * https://github.com/onflow/Flow-Wallet-Kit/blob/master/iOS/FlowWalletKit/Sources/Keys/KeyProtocol.swift
 */

import { type KeyType, type SignatureAlgorithm, type HashAlgorithm } from './key';
import { type StorageProtocol } from './storage';
import {
  type EthUnsignedTransaction,
  type EthSignedTransaction,
  type EthSignedMessage,
  type HexLike,
} from '../services/eth-signer';

/**
 * Key protocol interface - exact match to iOS Flow Wallet Kit KeyProtocol.swift
 */
export interface KeyProtocol<TKey = any, TSecret = any, TAdvance = any> {
  /** Key type strategy */
  readonly keyType: KeyType;

  /** Storage backend for persistence */
  storage: StorageProtocol;

  // Static factory methods (implement as static methods in concrete classes)
  // create(storage: StorageProtocol): Promise<TKey>;
  // createAdvanced(advance: TAdvance, storage: StorageProtocol): Promise<TKey>;
  // createAndStore(id: string, password: string, storage: StorageProtocol): Promise<TKey>;
  // get(id: string, password: string, storage: StorageProtocol): Promise<TKey>;
  // restore(secret: TSecret, storage: StorageProtocol): Promise<TKey>;

  // Instance methods

  /**
   * Store key with password protection
   */
  store(id: string, password: string): Promise<void>;

  /**
   * Extract public key for given signature algorithm
   */
  publicKey(
    signAlgo: SignatureAlgorithm,
    derivationPath: string | undefined
  ): Promise<Uint8Array | null>;

  /**
   * Extract private key for given signature algorithm (use with caution)
   */
  privateKey(
    signAlgo: SignatureAlgorithm,
    derivationPath: string | undefined
  ): Promise<Uint8Array | null>;

  /**
   * Sign data with specified algorithms
   */
  sign(
    data: Uint8Array,
    signAlgo: SignatureAlgorithm,
    hashAlgo: HashAlgorithm
  ): Promise<Uint8Array>;

  /**
   * Validate a signature against a message
   */
  isValidSignature(
    signature: Uint8Array,
    message: Uint8Array,
    signAlgo: SignatureAlgorithm
  ): Promise<boolean>;

  /**
   * Securely remove key from storage
   */
  remove(id: string): Promise<void>;

  /**
   * List all stored key identifiers
   */
  allKeys(): Promise<string[]>;
}

/**
 * Ethereum key protocol interface - matches FlowWalletKit/Sources/Keys/EthereumKeyProtocol.swift
 * Provides EVM-compatible key derivation and signing capabilities
 */
export interface EthereumKeyProtocol {
  /**
   * Derive the EIP-55 checksummed address for the given derivation index.
   * Defaults to the first account index (0).
   */
  ethAddress(index?: number): Promise<string>;

  /**
   * Return the uncompressed secp256k1 public key (65 bytes, 0x04-prefixed).
   */
  ethPublicKey(index?: number): Promise<Uint8Array>;

  /**
   * Return the raw 32-byte secp256k1 private key for the derivation index.
   */
  ethPrivateKey(index?: number): Promise<Uint8Array>;

  /**
   * Sign a 32-byte digest using Ethereum secp256k1 scheme and return [r|s|v].
   */
  ethSign(digest: Uint8Array, index?: number): Promise<Uint8Array>;

  /**
   * Sign an Ethereum transaction and return encoded payload with signature.
   */
  ethSignTransaction(
    transaction: EthUnsignedTransaction,
    index?: number
  ): Promise<EthSignedTransaction>;

  /**
   * Sign an Ethereum personal message / EIP-191 payload.
   */
  ethSignPersonalMessage(message: HexLike, index?: number): Promise<EthSignedMessage>;

  /**
   * Sign an EIP-712 typed data payload.
   */
  ethSignTypedData(typedData: Record<string, unknown>, index?: number): Promise<EthSignedMessage>;
}

/**
 * Key data structure for SeedPhrase keys
 */
export interface KeyData {
  mnemonic: string;
  derivationPath: string;
  passphrase?: string;
}

/**
 * Security check delegate for sensitive operations
 */
export interface SecurityCheckDelegate {
  performSecurityCheck(): Promise<boolean>;
  verifyAuthentication(): Promise<boolean>;
}
