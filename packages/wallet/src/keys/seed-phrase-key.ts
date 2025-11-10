/**
 * SeedPhraseKey implementation - exact match to iOS Flow Wallet Kit SeedPhraseKey.swift
 * Uses Trust Wallet Core for cryptographic operations
 */

import type { HDWallet } from '@trustwallet/wallet-core/dist/src/wallet-core';

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
      '[SeedPhraseKey] Failed to load native wallet-core-provider:',
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
  type KeyData,
  SignatureAlgorithm,
  HashAlgorithm,
  BIP44_PATHS,
} from '../types/key';

/**
 * SeedPhrase-based key implementation using Trust Wallet Core
 * Matches iOS FlowWalletKit/Sources/Keys/SeedPhraseKey.swift
 */
export class SeedPhraseKey
  implements KeyProtocol<SeedPhraseKey, KeyData, KeyData>, EthereumKeyProtocol
{
  readonly keyType = KeyType.SeedPhrase;
  storage: StorageProtocol;

  // Private properties
  private derivationPath: string;
  private passphrase: string;
  private hdWallet?: HDWallet; // Trust Wallet Core HDWallet
  private mnemonic: string;

  constructor(
    storage: StorageProtocol,
    flowCustomDerivationPath: string = BIP44_PATHS.FLOW, // Flow custom default
    passphrase: string = '',
    hdWallet?: HDWallet,
    mnemonic?: string
  ) {
    this.storage = storage;
    this.derivationPath = flowCustomDerivationPath;
    this.passphrase = passphrase;
    this.hdWallet = hdWallet;
    this.mnemonic = mnemonic || '';
  }

  // Static factory methods (matches iOS KeyProtocol)

  /**
   * Create new SeedPhrase key with random mnemonic
   */
  static async create(storage: StorageProtocol): Promise<SeedPhraseKey> {
    await WalletCoreProvider.initialize();

    const { wallet, mnemonic } = await WalletCoreProvider.createHDWallet(256, '');

    return new SeedPhraseKey(
      storage,
      BIP44_PATHS.FLOW, // Flow default derivation path
      '',
      wallet,
      mnemonic
    );
  }

  /**
   * Create SeedPhrase key with advanced parameters
   */
  static async createAdvanced(advance: KeyData, storage: StorageProtocol): Promise<SeedPhraseKey> {
    await WalletCoreProvider.initialize();

    // Validate the provided mnemonic
    const isValid = await WalletCoreProvider.validateMnemonic(advance.mnemonic);
    if (!isValid) {
      throw WalletError.MnemonicInvalid();
    }

    const wallet = await WalletCoreProvider.restoreHDWallet(advance.mnemonic, advance.passphrase);

    return new SeedPhraseKey(
      storage,
      advance.derivationPath || BIP44_PATHS.FLOW,
      advance.passphrase || '',
      wallet,
      advance.mnemonic
    );
  }

  /**
   * Create and immediately store SeedPhrase key
   */
  static async createAndStore(
    id: string,
    password: string,
    storage: StorageProtocol
  ): Promise<SeedPhraseKey> {
    const key = await this.create(storage);
    await key.store(id, password);
    return key;
  }

  /**
   * Retrieve existing SeedPhrase key by ID and password
   */
  static async get(id: string, password: string, storage: StorageProtocol): Promise<SeedPhraseKey> {
    await WalletCoreProvider.initialize();

    // Get encrypted data from storage
    const encryptedData = await storage.get(id);
    if (!encryptedData) {
      throw WalletError.PrivateKeyUnavailable({ details: { id } });
    }

    // Decrypt the key data using password
    // This would involve PBKDF2 + AES decryption using Trust Wallet Core
    const decryptedData = await this.decryptKeyData(encryptedData, password);
    const keyData: KeyData = JSON.parse(new TextDecoder().decode(decryptedData));

    // Restore wallet from decrypted mnemonic
    const wallet = await WalletCoreProvider.restoreHDWallet(keyData.mnemonic, keyData.passphrase);

    return new SeedPhraseKey(
      storage,
      keyData.derivationPath,
      keyData.passphrase || '',
      wallet,
      keyData.mnemonic
    );
  }

  /**
   * Restore SeedPhrase key from secret (KeyData)
   */
  static async restore(secret: KeyData, storage: StorageProtocol): Promise<SeedPhraseKey> {
    return await this.createAdvanced(secret, storage);
  }

  // Instance methods (matches iOS KeyProtocol)

  /**
   * Store key with password protection
   */
  async store(id: string, password: string): Promise<void> {
    const keyData: KeyData = {
      mnemonic: this.mnemonic,
      derivationPath: this.derivationPath,
      passphrase: this.passphrase,
    };

    // Encrypt the key data using password
    const encryptedData = await SeedPhraseKey.encryptKeyData(keyData, password);

    // Store encrypted data
    await this.storage.set(id, encryptedData);
  }

  /**
   * Extract public key for given signature algorithm (matches iOS implementation)
   */
  async publicKey(
    signAlgo: SignatureAlgorithm,
    derivationPath: string | undefined = undefined
  ): Promise<Uint8Array | null> {
    if (!this.hdWallet) {
      throw WalletError.KeyNotInitialized();
    }

    // Use the Flow-specific method that supports both P-256 and secp256k1
    const publicKeyHex = await WalletCoreProvider.getFlowPublicKeyBySignatureAlgorithm(
      this.hdWallet,
      signAlgo,
      derivationPath || this.derivationPath
    );

    // Convert hex to bytes and remove '04' prefix if present (matches iOS format() method)
    const publicKeyBytes = await WalletCoreProvider.hexToBytes(publicKeyHex);

    // Remove '04' prefix if present (uncompressed key format indicator)
    if (publicKeyBytes.length > 64 && publicKeyBytes[0] === 0x04) {
      return publicKeyBytes.slice(1);
    }

    return publicKeyBytes;
  }

  /**
   * Extract private key for given signature algorithm (use with caution - matches iOS implementation)
   */
  async privateKey(
    signAlgo: SignatureAlgorithm,
    derivationPath: string | undefined = undefined
  ): Promise<Uint8Array | null> {
    if (!this.hdWallet) {
      throw WalletError.KeyNotInitialized();
    }

    // Get private key by signature algorithm for Flow (matches iOS implementation)
    const privateKey = await WalletCoreProvider.getFlowPrivateKeyBySignatureAlgorithm(
      this.hdWallet,
      signAlgo,
      derivationPath || this.derivationPath
    );

    try {
      // Get private key data
      const privateKeyData = privateKey.data();
      return new Uint8Array(privateKeyData);
    } finally {
      // Secure cleanup (matches iOS defer pattern)
      if (privateKey && typeof privateKey.delete === 'function') {
        privateKey.delete();
      }
    }
  }

  /**
   * Sign data with specified algorithms (matches iOS implementation)
   */
  async sign(
    data: Uint8Array,
    signAlgo: SignatureAlgorithm,
    hashAlgo: HashAlgorithm
  ): Promise<Uint8Array> {
    if (!this.hdWallet) {
      throw WalletError.KeyNotInitialized();
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

    // Get private key by curve and sign (matches iOS implementation)
    const privateKey = await WalletCoreProvider.getFlowPrivateKeyBySignatureAlgorithm(
      this.hdWallet,
      signAlgo,
      this.derivationPath
    );

    try {
      // Determine curve based on signature algorithm
      // For native implementation, use string identifiers; for web, use core.Curve enum
      let curve: any;
      try {
        // Try to get core (web/WASM implementation)
        const core = await WalletCoreProvider['getCore']();
        switch (signAlgo) {
          case SignatureAlgorithm.ECDSA_P256:
            curve = core.Curve.nist256p1;
            break;
          case SignatureAlgorithm.ECDSA_secp256k1:
            curve = core.Curve.secp256k1;
            break;
          default:
            throw WalletError.UnsupportedSignatureAlgorithm({
              details: { signatureAlgorithm: signAlgo },
            });
        }
      } catch {
        // Native implementation - use string identifiers
        switch (signAlgo) {
          case SignatureAlgorithm.ECDSA_P256:
            curve = 'nist256p1';
            break;
          case SignatureAlgorithm.ECDSA_secp256k1:
            curve = 'secp256k1';
            break;
          default:
            throw WalletError.UnsupportedSignatureAlgorithm({
              details: { signatureAlgorithm: signAlgo },
            });
        }
      }

      // Sign with the private key and curve (matches iOS pk.sign(digest: hashed, curve: curve))
      const signature = privateKey.sign(hashedData, curve);

      // Convert to Uint8Array and drop last byte (matches iOS signature.dropLast())
      const signatureArray = new Uint8Array(signature);
      return signatureArray.slice(0, -1);
    } finally {
      // Secure cleanup (matches iOS defer pattern)
      if (privateKey && typeof privateKey.delete === 'function') {
        privateKey.delete();
      }
    }
  }

  /**
   * Derive Ethereum address for the given index using WalletCore.
   */
  async ethAddress(index: number = 0): Promise<string> {
    const privateKeyBytes = await this.ethPrivateKey(index);
    return await WalletCoreProvider.deriveEVMAddressFromPrivateKey(privateKeyBytes);
  }

  /**
   * Return uncompressed secp256k1 public key for Ethereum (65 bytes, 0x04-prefixed).
   */
  async ethPublicKey(index: number = 0): Promise<Uint8Array> {
    const privateKeyBytes = await this.ethPrivateKey(index);
    return await WalletCoreProvider.deriveEVMPublicKeyFromPrivateKey(privateKeyBytes, false);
  }

  /**
   * Return raw 32-byte secp256k1 private key for Ethereum derivation index.
   */
  async ethPrivateKey(index: number = 0): Promise<Uint8Array> {
    if (!this.hdWallet) {
      throw WalletError.KeyNotInitialized();
    }

    const privateKey = await WalletCoreProvider.getEVMPrivateKey(this.hdWallet, index);

    try {
      const keyData = privateKey.data();
      return new Uint8Array(keyData);
    } finally {
      if (privateKey && typeof privateKey.delete === 'function') {
        privateKey.delete();
      }
    }
  }

  /**
   * Sign a 32-byte digest using secp256k1 and return [r|s|v] signature bytes.
   */
  async ethSign(digest: Uint8Array, index: number = 0): Promise<Uint8Array> {
    const privateKeyBytes = await this.ethPrivateKey(index);
    return await WalletCoreProvider.signEvmDigestWithPrivateKey(privateKeyBytes, digest);
  }

  /**
   * Sign an Ethereum transaction and return encoded payload.
   */
  async ethSignTransaction(
    transaction: EthUnsignedTransaction,
    index: number = 0
  ): Promise<EthSignedTransaction> {
    const privateKeyBytes = await this.ethPrivateKey(index);
    return await EthSigner.signTransaction(transaction, privateKeyBytes);
  }

  /**
   * Sign an Ethereum personal message (EIP-191).
   */
  async ethSignPersonalMessage(message: HexLike, index: number = 0): Promise<EthSignedMessage> {
    const privateKeyBytes = await this.ethPrivateKey(index);
    return await EthSigner.signPersonalMessage(privateKeyBytes, message);
  }

  /**
   * Sign EIP-712 typed data.
   */
  async ethSignTypedData(
    typedData: Record<string, unknown>,
    index: number = 0
  ): Promise<EthSignedMessage> {
    const privateKeyBytes = await this.ethPrivateKey(index);
    return await EthSigner.signTypedData(privateKeyBytes, typedData);
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
    // This requires additional crypto libraries for signature verification
    throw WalletError.SigningFailed({
      message: 'Signature validation not implemented - requires crypto signature verification',
    });
  }

  /**
   * Securely remove key from storage
   */
  async remove(id: string): Promise<void> {
    await this.storage.remove(id);

    // Clean up HD wallet
    if (this.hdWallet) {
      WalletCoreProvider.deleteWallet(this.hdWallet);
      this.hdWallet = undefined;
    }
  }

  /**
   * List all stored key identifiers
   */
  async allKeys(): Promise<string[]> {
    return await this.storage.findKey('seedphrase:');
  }

  // Private helper methods for encryption/decryption

  private static async encryptKeyData(keyData: KeyData, password: string): Promise<Uint8Array> {
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

  get derivationPathString(): string {
    return this.derivationPath;
  }

  get mnemonicString(): string {
    return this.mnemonic;
  }

  get passphraseString(): string {
    return this.passphrase;
  }
}
