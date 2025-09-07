/**
 * Key management types based on Flow Wallet Kit iOS KeyProtocol
 */

/**
 * Supported key types - based on iOS Flow Wallet Kit
 */
export enum KeyType {
  MNEMONIC = 'mnemonic',
  PRIVATE_KEY = 'private_key',
  WATCH_ONLY = 'watch_only',
  // Future extensions
  HARDWARE = 'hardware',
  SECURE_ELEMENT = 'secure_element',
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
