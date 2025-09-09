/**
 * PrivateKey implementation - exact match to iOS Flow Wallet Kit PrivateKey.swift
 * Uses Trust Wallet Core for cryptographic operations
 */

import { WalletCoreProvider } from '../crypto/wallet-core-provider';
import {
  KeyType,
  type KeyProtocol,
  type StorageProtocol,
  SignatureAlgorithm,
  HashAlgorithm,
} from '../types/key';

/**
 * Raw private key implementation using Trust Wallet Core
 * Matches iOS FlowWalletKit/Sources/Keys/PrivateKey.swift
 */
export class PrivateKey implements KeyProtocol<PrivateKey, Uint8Array, Uint8Array> {
  readonly keyType = KeyType.PrivateKey;
  storage: StorageProtocol;

  // Private properties
  private privateKeyData: Uint8Array;
  private signatureAlgorithm: SignatureAlgorithm;

  constructor(
    storage: StorageProtocol,
    privateKeyData: Uint8Array,
    signatureAlgorithm: SignatureAlgorithm = SignatureAlgorithm.ECDSA_P256
  ) {
    this.storage = storage;
    this.privateKeyData = privateKeyData;
    this.signatureAlgorithm = signatureAlgorithm;
  }

  // Static factory methods (matches iOS KeyProtocol)

  /**
   * Create new PrivateKey with random key material
   */
  static async create(storage: StorageProtocol): Promise<PrivateKey> {
    await WalletCoreProvider.initialize();

    // Generate random private key (32 bytes for both P-256 and secp256k1)
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));

    return new PrivateKey(
      storage,
      randomBytes,
      SignatureAlgorithm.ECDSA_P256 // Default to P-256 for Flow
    );
  }

  /**
   * Create PrivateKey with specific key data
   */
  static async createAdvanced(advance: Uint8Array, storage: StorageProtocol): Promise<PrivateKey> {
    await WalletCoreProvider.initialize();

    // Validate key length
    if (advance.length !== 32) {
      throw new Error('Private key must be 32 bytes');
    }

    return new PrivateKey(storage, advance, SignatureAlgorithm.ECDSA_P256);
  }

  /**
   * Create and immediately store PrivateKey
   */
  static async createAndStore(
    id: string,
    password: string,
    storage: StorageProtocol
  ): Promise<PrivateKey> {
    const key = await this.create(storage);
    await key.store(id, password);
    return key;
  }

  /**
   * Retrieve existing PrivateKey by ID and password
   */
  static async get(id: string, password: string, storage: StorageProtocol): Promise<PrivateKey> {
    await WalletCoreProvider.initialize();

    // Get encrypted data from storage
    const encryptedData = await storage.get(id);
    if (!encryptedData) {
      throw new Error(`Key with ID ${id} not found`);
    }

    // Decrypt the key data using password
    const decryptedData = await this.decryptKeyData(encryptedData, password);

    // Extract private key and signature algorithm
    const keyData = JSON.parse(new TextDecoder().decode(decryptedData));
    const privateKeyBytes = await WalletCoreProvider.hexToBytes(keyData.privateKey);
    const signatureAlgorithm = keyData.signatureAlgorithm || SignatureAlgorithm.ECDSA_P256;

    return new PrivateKey(storage, privateKeyBytes, signatureAlgorithm);
  }

  /**
   * Restore PrivateKey from secret (raw bytes)
   */
  static async restore(secret: Uint8Array, storage: StorageProtocol): Promise<PrivateKey> {
    return await this.createAdvanced(secret, storage);
  }

  // Instance methods (matches iOS KeyProtocol)

  /**
   * Store key with password protection
   */
  async store(id: string, password: string): Promise<void> {
    const keyData = {
      privateKey: await WalletCoreProvider.bytesToHex(this.privateKeyData),
      signatureAlgorithm: this.signatureAlgorithm,
      keyType: this.keyType,
      timestamp: Date.now(),
    };

    // Encrypt the key data using password
    const encryptedData = await PrivateKey.encryptKeyData(keyData, password);

    // Store encrypted data
    await this.storage.set(id, encryptedData);
  }

  /**
   * Extract public key for given signature algorithm
   */
  async publicKey(signAlgo: SignatureAlgorithm): Promise<Uint8Array | null> {
    try {
      switch (signAlgo) {
        case SignatureAlgorithm.ECDSA_P256:
          // P-256 public key derivation
          // This requires additional cryptographic library since Trust Wallet Core
          // doesn't directly support P-256 key derivation from raw bytes
          return this.deriveP256PublicKey(this.privateKeyData);

        case SignatureAlgorithm.ECDSA_secp256k1:
          // secp256k1 public key derivation
          return this.deriveSecp256k1PublicKey(this.privateKeyData);

        default:
          throw new Error(`Unsupported signature algorithm: ${signAlgo}`);
      }
    } catch (error) {
      console.error('Failed to derive public key:', error);
      return null;
    }
  }

  /**
   * Extract private key for given signature algorithm (use with caution)
   */
  async privateKey(signAlgo: SignatureAlgorithm): Promise<Uint8Array | null> {
    // For PrivateKey implementation, we return the stored private key
    // if it matches the requested algorithm
    if (signAlgo === this.signatureAlgorithm) {
      return new Uint8Array(this.privateKeyData);
    }

    // If algorithms don't match, we can't derive a different private key
    return null;
  }

  /**
   * Sign data with specified algorithms
   */
  async sign(
    data: Uint8Array,
    signAlgo: SignatureAlgorithm,
    hashAlgo: HashAlgorithm
  ): Promise<Uint8Array> {
    // Verify we can sign with the requested algorithm
    if (signAlgo !== this.signatureAlgorithm) {
      throw new Error(`Cannot sign with ${signAlgo}, key is ${this.signatureAlgorithm}`);
    }

    // First hash the data according to the specified algorithm
    let hashedData: Uint8Array;
    switch (hashAlgo) {
      case HashAlgorithm.SHA2_256:
        hashedData = await WalletCoreProvider.hashSHA256(data);
        break;
      case HashAlgorithm.SHA3_256:
        hashedData = await WalletCoreProvider.hashSHA3(data);
        break;
      default:
        throw new Error(`Unsupported hash algorithm: ${hashAlgo}`);
    }

    // Sign the hashed data with the private key
    switch (signAlgo) {
      case SignatureAlgorithm.ECDSA_P256:
        return this.signWithP256(hashedData);

      case SignatureAlgorithm.ECDSA_secp256k1:
        return this.signWithSecp256k1(hashedData);

      default:
        throw new Error(`Unsupported signature algorithm: ${signAlgo}`);
    }
  }

  /**
   * Validate a signature against a message
   */
  async isValidSignature(
    signature: Uint8Array,
    message: Uint8Array,
    signAlgo: SignatureAlgorithm
  ): Promise<boolean> {
    // Get public key for the signature algorithm
    const publicKeyBytes = await this.publicKey(signAlgo);
    if (!publicKeyBytes) {
      return false;
    }

    // Implementation would verify signature using appropriate cryptographic library
    throw new Error(
      'Signature validation not implemented - requires crypto signature verification'
    );
  }

  /**
   * Securely remove key from storage
   */
  async remove(id: string): Promise<void> {
    await this.storage.remove(id);

    // Clear private key from memory
    this.privateKeyData.fill(0);
  }

  /**
   * List all stored key identifiers
   */
  async allKeys(): Promise<string[]> {
    return await this.storage.findKey('privatekey:');
  }

  // Private helper methods for cryptographic operations

  private async deriveP256PublicKey(privateKey: Uint8Array): Promise<Uint8Array> {
    // Use Wallet Core to derive P-256 public key (matches iOS implementation)
    try {
      await WalletCoreProvider.initialize();

      // Create PrivateKey from raw bytes
      const walletCorePrivateKey = await this.createWalletCorePrivateKey(privateKey);

      try {
        // Get public key using Nist256p1 curve
        const publicKey = walletCorePrivateKey.getPublicKeyNist256p1();
        const uncompressedData = publicKey.uncompressed
          ? publicKey.uncompressed.data()
          : publicKey.data();

        // Convert to Uint8Array and remove '04' prefix if present
        const publicKeyBytes = new Uint8Array(uncompressedData);
        if (publicKeyBytes.length > 64 && publicKeyBytes[0] === 0x04) {
          return publicKeyBytes.slice(1);
        }

        return publicKeyBytes;
      } finally {
        // Secure cleanup
        if (walletCorePrivateKey && typeof walletCorePrivateKey.delete === 'function') {
          walletCorePrivateKey.delete();
        }
      }
    } catch (error) {
      throw new Error(`P-256 public key derivation failed: ${error}`);
    }
  }

  private async deriveSecp256k1PublicKey(privateKey: Uint8Array): Promise<Uint8Array> {
    // Use Wallet Core to derive secp256k1 public key (matches iOS implementation)
    try {
      await WalletCoreProvider.initialize();

      // Create PrivateKey from raw bytes
      const walletCorePrivateKey = await this.createWalletCorePrivateKey(privateKey);

      try {
        // Get public key using secp256k1 curve (uncompressed)
        const publicKey = walletCorePrivateKey.getPublicKeySecp256k1(false);
        const uncompressedData = publicKey.uncompressed
          ? publicKey.uncompressed.data()
          : publicKey.data();

        // Convert to Uint8Array and remove '04' prefix if present
        const publicKeyBytes = new Uint8Array(uncompressedData);
        if (publicKeyBytes.length > 64 && publicKeyBytes[0] === 0x04) {
          return publicKeyBytes.slice(1);
        }

        return publicKeyBytes;
      } finally {
        // Secure cleanup
        if (walletCorePrivateKey && typeof walletCorePrivateKey.delete === 'function') {
          walletCorePrivateKey.delete();
        }
      }
    } catch (error) {
      throw new Error(`secp256k1 public key derivation failed: ${error}`);
    }
  }

  /**
   * Create WalletCore PrivateKey from raw bytes (matches iOS implementation)
   */
  private async createWalletCorePrivateKey(privateKeyBytes: Uint8Array): Promise<any> {
    return await WalletCoreProvider.createPrivateKeyFromBytes(privateKeyBytes);
  }

  private async signWithP256(hashedData: Uint8Array): Promise<Uint8Array> {
    // Use WalletCore to sign with P-256 curve (matches iOS implementation)
    return await WalletCoreProvider.signWithPrivateKey(
      this.privateKeyData,
      hashedData,
      'ECDSA_P256'
    );
  }

  private async signWithSecp256k1(hashedData: Uint8Array): Promise<Uint8Array> {
    // Use WalletCore to sign with secp256k1 curve (matches iOS implementation)
    return await WalletCoreProvider.signWithPrivateKey(
      this.privateKeyData,
      hashedData,
      'ECDSA_secp256k1'
    );
  }

  // Private helper methods for encryption/decryption

  private static async encryptKeyData(keyData: any, password: string): Promise<Uint8Array> {
    // Generate salt for PBKDF2
    const salt = crypto.getRandomValues(new Uint8Array(32));

    // Derive key using PBKDF2
    const derivedKey = await WalletCoreProvider.pbkdf2(password, salt, 10000, 32);

    // Generate IV for AES
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt data using AES-GCM
    const plaintext = new TextEncoder().encode(JSON.stringify(keyData));
    const encryptedData = await WalletCoreProvider.aesEncrypt(plaintext, derivedKey, iv);

    // Combine salt + iv + encrypted data
    const result = new Uint8Array(salt.length + iv.length + encryptedData.length);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(encryptedData, salt.length + iv.length);

    return result;
  }

  private static async decryptKeyData(
    encryptedData: Uint8Array,
    password: string
  ): Promise<Uint8Array> {
    // Extract salt, IV, and encrypted data
    const salt = encryptedData.slice(0, 32);
    const iv = encryptedData.slice(32, 44);
    const ciphertext = encryptedData.slice(44);

    // Derive key using PBKDF2
    const derivedKey = await WalletCoreProvider.pbkdf2(password, salt, 10000, 32);

    // Decrypt data using AES-GCM
    const decryptedData = await WalletCoreProvider.aesDecrypt(ciphertext, derivedKey, iv);

    return decryptedData;
  }

  // Getters for accessing private properties (matches iOS interface)

  get privateKeyBytes(): Uint8Array {
    return new Uint8Array(this.privateKeyData);
  }

  get algorithm(): SignatureAlgorithm {
    return this.signatureAlgorithm;
  }
}
