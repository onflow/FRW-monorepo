/**
 * PrivateKey implementation - exact match to iOS Flow Wallet Kit PrivateKey.swift
 * Uses Trust Wallet Core for cryptographic operations
 */

// Platform-specific import - React Native uses pure JS, Web uses WASM
// Metro should auto-resolve .native.ts files, but we use require() as fallback
let WalletCoreProvider: any;

// Enhanced React Native detection
const isReactNative =
  (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') ||
  (typeof global !== 'undefined' && typeof (global as any).__fbBatchedBridge !== 'undefined') ||
  (typeof window !== 'undefined' && typeof (window as any).__fbBatchedBridge !== 'undefined');

if (isReactNative) {
  // React Native: Use native implementation (pure JS crypto)
  try {
    WalletCoreProvider = require('../crypto/wallet-core-provider.native').WalletCoreProvider;
  } catch (error: any) {
    console.error(
      '[PrivateKey] Failed to load native wallet-core-provider:',
      error?.message || error
    );
    throw new Error(
      `Failed to load native wallet-core-provider in React Native: ${error?.message || 'Unknown error'}`
    );
  }
} else {
  // Web/Extension: Use WASM implementation
  WalletCoreProvider = require('../crypto/wallet-core-provider').WalletCoreProvider;
}
import {
  EthSigner,
  type EthUnsignedTransaction,
  type EthSignedTransaction,
  type EthSignedMessage,
  type HexLike,
} from '../services/eth-signer';
import { WalletError } from '../types/errors';
import {
  KeyType,
  type KeyProtocol,
  type EthereumKeyProtocol,
  type StorageProtocol,
  SignatureAlgorithm,
  HashAlgorithm,
} from '../types/key';

/**
 * Raw private key implementation using Trust Wallet Core
 * Matches iOS FlowWalletKit/Sources/Keys/PrivateKey.swift
 */
export class PrivateKey
  implements KeyProtocol<PrivateKey, Uint8Array, Uint8Array>, EthereumKeyProtocol
{
  readonly keyType = KeyType.PrivateKey;
  storage: StorageProtocol;

  // Private properties
  private privateKeyData: Uint8Array;
  private signatureAlgorithm: SignatureAlgorithm;

  constructor(
    storage: StorageProtocol,
    privateKeyData: Uint8Array,
    signatureAlgorithm: SignatureAlgorithm = SignatureAlgorithm.ECDSA_secp256k1
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
  static async createAdvanced(
    advance: Uint8Array,
    storage: StorageProtocol,
    signatureAlgorithm: SignatureAlgorithm = SignatureAlgorithm.ECDSA_P256
  ): Promise<PrivateKey> {
    await WalletCoreProvider.initialize();

    // Validate key length
    if (advance.length !== 32) {
      throw WalletError.PrivateKeyUnavailable({
        details: { expectedLength: 32, receivedLength: advance.length },
      });
    }

    return new PrivateKey(storage, advance, signatureAlgorithm);
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
      throw WalletError.PrivateKeyUnavailable({ details: { id } });
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
  static async restore(
    secret: Uint8Array,
    storage: StorageProtocol,
    signatureAlgorithm: SignatureAlgorithm = SignatureAlgorithm.ECDSA_P256
  ): Promise<PrivateKey> {
    return await this.createAdvanced(secret, storage, signatureAlgorithm);
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
        throw WalletError.UnsupportedSignatureAlgorithm({
          details: { signatureAlgorithm: signAlgo },
        });
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
      throw WalletError.UnsupportedSignatureAlgorithm({
        details: {
          requested: signAlgo,
          available: this.signatureAlgorithm,
        },
      });
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
        throw WalletError.UnsupportedHashAlgorithm({
          details: { hashAlgorithm: hashAlgo },
        });
    }

    // Sign the hashed data with the private key
    switch (signAlgo) {
      case SignatureAlgorithm.ECDSA_P256:
        return this.signWithP256(hashedData);

      case SignatureAlgorithm.ECDSA_secp256k1:
        return this.signWithSecp256k1(hashedData);

      default:
        throw WalletError.UnsupportedSignatureAlgorithm({
          details: { signatureAlgorithm: signAlgo },
        });
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
    throw WalletError.SigningFailed({
      message: 'Signature validation not implemented - requires crypto signature verification',
    });
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

  /**
   * Derive Ethereum address from raw private key (only index 0 supported).
   */
  async ethAddress(index: number = 0): Promise<string> {
    if (index !== 0) {
      throw WalletError.InvalidDerivationIndex({ details: { index } });
    }

    return await WalletCoreProvider.deriveEVMAddressFromPrivateKey(this.privateKeyData);
  }

  /**
   * Return uncompressed secp256k1 public key (65 bytes, 0x04-prefixed).
   */
  async ethPublicKey(index: number = 0): Promise<Uint8Array> {
    if (index !== 0) {
      throw WalletError.InvalidDerivationIndex({ details: { index } });
    }

    return await WalletCoreProvider.deriveEVMPublicKeyFromPrivateKey(this.privateKeyData, false);
  }

  /**
   * Return raw 32-byte secp256k1 private key.
   */
  async ethPrivateKey(index: number = 0): Promise<Uint8Array> {
    if (index !== 0) {
      throw WalletError.InvalidDerivationIndex({ details: { index } });
    }

    return new Uint8Array(this.privateKeyData);
  }

  /**
   * Sign 32-byte digest and return Ethereum [r|s|v] signature.
   */
  async ethSign(digest: Uint8Array, index: number = 0): Promise<Uint8Array> {
    if (index !== 0) {
      throw WalletError.InvalidDerivationIndex({ details: { index } });
    }

    return await WalletCoreProvider.signEvmDigestWithPrivateKey(this.privateKeyData, digest);
  }

  /**
   * Sign an Ethereum transaction.
   */
  async ethSignTransaction(
    transaction: EthUnsignedTransaction,
    index: number = 0
  ): Promise<EthSignedTransaction> {
    if (index !== 0) {
      throw WalletError.InvalidDerivationIndex({ details: { index } });
    }

    return await EthSigner.signTransaction(transaction, this.privateKeyData);
  }

  /**
   * Sign an Ethereum personal message (EIP-191).
   */
  async ethSignPersonalMessage(message: HexLike, index: number = 0): Promise<EthSignedMessage> {
    if (index !== 0) {
      throw WalletError.InvalidDerivationIndex({ details: { index } });
    }

    return await EthSigner.signPersonalMessage(this.privateKeyData, message);
  }

  /**
   * Sign EIP-712 typed data.
   */
  async ethSignTypedData(
    typedData: Record<string, unknown>,
    index: number = 0
  ): Promise<EthSignedMessage> {
    if (index !== 0) {
      throw WalletError.InvalidDerivationIndex({ details: { index } });
    }

    return await EthSigner.signTypedData(this.privateKeyData, typedData);
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
      throw WalletError.DerivationFailed({
        cause: error,
        details: { curve: 'P256' },
      });
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
      throw WalletError.DerivationFailed({
        cause: error,
        details: { curve: 'secp256k1' },
      });
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
