/**
 * Key protocol interface - exact match to iOS Flow Wallet Kit KeyProtocol.swift
 * https://github.com/onflow/Flow-Wallet-Kit/blob/master/iOS/FlowWalletKit/Sources/Keys/KeyProtocol.swift
 */

import { type KeyType, type SignatureAlgorithm, type HashAlgorithm } from './key';
import { type StorageProtocol } from './storage';

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
