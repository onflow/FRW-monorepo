/**
 * Key management types based on Flow Wallet Kit iOS KeyProtocol
 */

/**
 * Supported key types - exact match to iOS Flow Wallet Kit KeyType.swift
 */
export enum KeyType {
  SeedPhrase = 'seedPhrase',
  PrivateKey = 'privateKey',
  SecureEnclave = 'secureEnclave',
}

/**
 * Storage abstraction for key persistence - exact match to iOS StorageProtocol.swift
 */
export interface StorageProtocol {
  readonly allKeys: string[];

  findKey(keyword: string): Promise<string[]>;
  get(key: string): Promise<Uint8Array | null>;
  set(key: string, value: Uint8Array): Promise<void>;
  remove(key: string): Promise<void>;
  removeAll(): Promise<void>;
}

/**
 * Cryptographic curve types
 */
export enum CurveType {
  P256 = 'P256',
  SECP256K1 = 'secp256k1',
}

/**
 * Signature algorithm types for Flow
 */
export enum SignatureAlgorithm {
  ECDSA_P256 = 'ECDSA_P256',
  ECDSA_secp256k1 = 'ECDSA_secp256k1',
}

/**
 * Hash algorithm types for Flow
 */
export enum HashAlgorithm {
  SHA2_256 = 'SHA2_256',
  SHA3_256 = 'SHA3_256',
}

/**
 * BIP44 derivation paths
 */
export const BIP44_PATHS = {
  FLOW: "m/44'/539'/0'/0/",
  EVM: "m/44'/60'/0'/0/",
} as const;

/**
 * Key derivation parameters
 */
export interface KeyDerivationParams {
  path: string;
  curve: CurveType;
  password?: string;
}

/**
 * Signature parameters for Flow
 */
export interface FlowSignatureParams {
  keyId: number;
  signAlgo: SignatureAlgorithm;
  hashAlgo: HashAlgorithm;
}

/**
 * Account key information from Flow blockchain
 */
export interface AccountKey {
  index: number;
  publicKey: string;
  signAlgo: SignatureAlgorithm;
  hashAlgo: HashAlgorithm;
  weight: number;
  revoked: boolean;
}

/**
 * Key material interface
 */
export interface KeyMaterial {
  publicKey: string;
  privateKey?: string; // undefined for watch-only accounts
  curve: CurveType;
  derivationPath: string;
}

/**
 * Encrypted key data stored in SecureStorage
 */
export interface EncryptedKeyData {
  id: string;
  type: KeyType;
  encryptedMnemonic?: string; // for mnemonic-based wallets
  encryptedPrivateKey?: string; // for private key wallets
  metadata: {
    curve: CurveType;
    createdAt: number;
    name?: string;
  };
}

/**
 * Key validation result
 */
export interface KeyValidationResult {
  valid: boolean;
  error?: string;
  suggestions?: string[];
}

/**
 * Key protocol interface - exact match to iOS Flow Wallet Kit KeyProtocol.swift
 * https://github.com/onflow/Flow-Wallet-Kit/blob/master/iOS/FlowWalletKit/Sources/Keys/KeyProtocol.swift
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
  publicKey(signAlgo: SignatureAlgorithm): Promise<Uint8Array | null>;

  /**
   * Extract private key for given signature algorithm (use with caution)
   */
  privateKey(signAlgo: SignatureAlgorithm): Promise<Uint8Array | null>;

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

/**
 * Flow chain ID enumeration
 */
export enum FlowChainID {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
}

/**
 * Flow address type
 */
export type FlowAddress = string;

/**
 * Flow account key from blockchain
 */
export interface FlowAccountKey {
  index: number;
  publicKey: FlowPublicKey;
  signAlgo: SignatureAlgorithm;
  hashAlgo: HashAlgorithm;
  weight: number;
  revoked: boolean;
}

/**
 * Flow public key
 */
export interface FlowPublicKey {
  hex: string;
  signAlgo: SignatureAlgorithm;
}

/**
 * Flow account data from blockchain
 */
export interface FlowAccountData {
  address: FlowAddress;
  balance: number;
  code: string;
  keys: FlowAccountKey[];
  contracts: Record<string, any>;
}

/**
 * Flow transaction for signing
 */
export interface FlowTransaction {
  script: string;
  arguments: any[];
  referenceBlockId: string;
  gasLimit: number;
  proposalKey: {
    address: FlowAddress;
    keyIndex: number;
    sequenceNumber: number;
  };
  payer: FlowAddress;
  authorizers: FlowAddress[];
}

/**
 * Flow signer protocol
 */
export interface FlowSigner {
  readonly address: FlowAddress;
  readonly keyIndex: number;

  sign(signableData: Uint8Array, transaction?: FlowTransaction): Promise<Uint8Array>;
}
