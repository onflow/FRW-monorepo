/**
 * React Native implementation of Trust Wallet Core integration for FRW
 * Uses pure JavaScript crypto libraries (@scure/bip39, @scure/bip32, @noble/curves)
 * Implements Trust Wallet Core types to match Android flow-wallet-kit
 */

import { p256 } from '@noble/curves/p256';
import { secp256k1 } from '@noble/curves/secp256k1';
import { HDKey } from '@scure/bip32';
import { generateMnemonic, validateMnemonic, mnemonicToSeedSync } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

import { WalletError } from '../types/errors';

/**
 * Trust Wallet Core compatible interfaces (local definitions to avoid WASM dependency)
 * These match the Trust Wallet Core API used by Android flow-wallet-kit
 */
export interface HDWallet {
  mnemonic(): string;
  getKeyByCurve(curve: any, derivationPath: string): PrivateKey;
  getKeyForCoin(coinType: any): PrivateKey;
  getAddressForCoin(coinType: any): string;
  delete(): void;
}

export interface PrivateKey {
  data(): Uint8Array;
  getPublicKeyNist256p1(): PublicKey;
  getPublicKeySecp256k1(compressed: boolean): PublicKey;
  sign(data: Uint8Array, curve: any): Uint8Array;
  delete(): void;
}

export interface PublicKey {
  data(): Uint8Array;
  uncompressed(): PublicKey;
  delete(): void;
}

/**
 * Native HDWallet implementation that matches Trust Wallet Core HDWallet interface
 * Uses pure JS crypto libraries internally but exposes the same API as Trust Wallet Core
 */
class NativeHDWallet implements HDWallet {
  private _mnemonic: string;
  private _hdKey: HDKey;

  constructor(mnemonic: string, hdKey: HDKey) {
    this._mnemonic = mnemonic;
    this._hdKey = hdKey;
  }

  mnemonic(): string {
    return this._mnemonic;
  }

  getKeyByCurve(curve: any, derivationPath: string): PrivateKey {
    // Derive child key at the specified path
    const derivedKey = this._hdKey.derive(derivationPath);

    if (!derivedKey.privateKey) {
      throw WalletError.KeyNotInitialized({ details: { derivationPath } });
    }

    const privateKeyBytes = derivedKey.privateKey;

    // Determine signature algorithm from curve
    let signatureAlgorithm: string;
    if (curve === 'nist256p1' || curve === 1) {
      signatureAlgorithm = 'ECDSA_P256';
    } else if (curve === 'secp256k1' || curve === 0) {
      signatureAlgorithm = 'ECDSA_secp256k1';
    } else {
      throw WalletError.UnsupportedSignatureAlgorithm({
        details: { curve: String(curve) },
      });
    }

    // Get public key based on the signature algorithm
    let publicKeyBytes: Uint8Array;
    if (signatureAlgorithm === 'ECDSA_P256') {
      publicKeyBytes = p256.getPublicKey(privateKeyBytes, false);
    } else {
      publicKeyBytes = secp256k1.getPublicKey(privateKeyBytes, false);
    }

    return new NativePrivateKey(privateKeyBytes, publicKeyBytes, signatureAlgorithm);
  }

  getKeyForCoin(coinType: any): PrivateKey {
    // Default to Flow derivation path for Flow coin type
    const derivationPath = "m/44'/539'/0'/0/0";
    // Use secp256k1 for most coins, but Flow uses P-256
    // For now, default to P-256 for Flow
    return this.getKeyByCurve('nist256p1', derivationPath);
  }

  getAddressForCoin(coinType: any): string {
    throw WalletError.UnsupportedOperation({
      details: { method: 'getAddressForCoin', platform: 'react-native' },
    });
  }

  delete(): void {
    // Cleanup (no-op for pure JS)
  }
}

/**
 * Native PrivateKey implementation that matches Trust Wallet Core PrivateKey interface
 */
class NativePrivateKey implements PrivateKey {
  private _privateKeyBytes: Uint8Array;
  private _publicKeyBytes: Uint8Array;
  private _signatureAlgorithm: string;

  constructor(privateKeyBytes: Uint8Array, publicKeyBytes: Uint8Array, signatureAlgorithm: string) {
    this._privateKeyBytes = privateKeyBytes;
    this._publicKeyBytes = publicKeyBytes;
    this._signatureAlgorithm = signatureAlgorithm;
  }

  data(): Uint8Array {
    return this._privateKeyBytes;
  }

  getPublicKeyNist256p1(): PublicKey {
    if (this._signatureAlgorithm !== 'ECDSA_P256') {
      throw WalletError.UnsupportedSignatureAlgorithm({
        details: {
          requested: 'ECDSA_P256',
          available: this._signatureAlgorithm,
        },
      });
    }
    return new NativePublicKey(this._publicKeyBytes);
  }

  getPublicKeySecp256k1(compressed: boolean): PublicKey {
    if (this._signatureAlgorithm !== 'ECDSA_secp256k1') {
      throw WalletError.UnsupportedSignatureAlgorithm({
        details: {
          requested: 'ECDSA_secp256k1',
          available: this._signatureAlgorithm,
        },
      });
    }
    // For now, we always use uncompressed (compressed not implemented)
    return new NativePublicKey(this._publicKeyBytes);
  }

  sign(data: Uint8Array, curve: any): Uint8Array {
    // Determine signature algorithm from curve
    let signAlgo: string;
    if (curve === 'nist256p1' || curve === 1) {
      signAlgo = 'ECDSA_P256';
    } else if (curve === 'secp256k1' || curve === 0) {
      signAlgo = 'ECDSA_secp256k1';
    } else {
      throw WalletError.UnsupportedSignatureAlgorithm({
        details: { curve: String(curve) },
      });
    }

    if (signAlgo !== this._signatureAlgorithm) {
      throw WalletError.UnsupportedSignatureAlgorithm({
        details: {
          requested: signAlgo,
          available: this._signatureAlgorithm,
        },
      });
    }

    // Sign using the appropriate curve
    const sig =
      signAlgo === 'ECDSA_P256'
        ? p256.sign(data, this._privateKeyBytes)
        : secp256k1.sign(data, this._privateKeyBytes);

    // Convert ECDSASigRecovered to Uint8Array (r|s format, 32 bytes each)
    // Convert bigint to bytes (big-endian, 32 bytes)
    const rHex = sig.r.toString(16).padStart(64, '0');
    const sHex = sig.s.toString(16).padStart(64, '0');

    const rBytes = new Uint8Array(32);
    const sBytes = new Uint8Array(32);

    for (let i = 0; i < 32; i++) {
      rBytes[i] = parseInt(rHex.substr(i * 2, 2), 16);
      sBytes[i] = parseInt(sHex.substr(i * 2, 2), 16);
    }

    return new Uint8Array([...rBytes, ...sBytes]);
  }

  delete(): void {
    // Cleanup (no-op for pure JS)
  }
}

/**
 * Native PublicKey implementation that matches Trust Wallet Core PublicKey interface
 */
class NativePublicKey implements PublicKey {
  private _publicKeyBytes: Uint8Array;

  constructor(publicKeyBytes: Uint8Array) {
    this._publicKeyBytes = publicKeyBytes;
  }

  data(): Uint8Array {
    return this._publicKeyBytes;
  }

  uncompressed(): PublicKey {
    // Already uncompressed
    return this;
  }

  delete(): void {
    // Cleanup (no-op for pure JS)
  }
}

/**
 * Wallet Core provider with Flow blockchain extensions (React Native)
 */
export class WalletCoreProvider {
  private static initialized = false;

  /**
   * Initialize - no-op for React Native (native module is always ready)
   */
  static async initialize(): Promise<void> {
    console.log('[WalletCoreProvider.native] initialize() called - Native implementation loaded!');
    this.initialized = true;
  }

  /**
   * Ensure initialized
   */
  private static async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Create HD wallet with mnemonic
   */
  static async createHDWallet(
    strength: number = 256,
    passphrase: string = ''
  ): Promise<{
    wallet: HDWallet;
    mnemonic: string;
  }> {
    await this.ensureInitialized();

    try {
      // @scure/bip39 expects strength in bits (128 = 12 words, 256 = 24 words)
      if (strength !== 128 && strength !== 256) {
        throw WalletError.InvalidNumericValue({
          details: { parameter: 'strength', value: strength, allowed: [128, 256] },
        });
      }

      // Generate mnemonic using @scure/bip39
      const mnemonic = generateMnemonic(wordlist, strength);

      // Generate seed from mnemonic
      const seedBytes = mnemonicToSeedSync(mnemonic, passphrase);

      // Create HDKey from seed for BIP32/BIP44 derivation
      const hdKey = HDKey.fromMasterSeed(seedBytes);

      const wallet = new NativeHDWallet(mnemonic, hdKey);

      return { wallet, mnemonic };
    } catch (error) {
      throw WalletError.InitializationFailed({ cause: error });
    }
  }

  /**
   * Restore HD wallet from mnemonic
   */
  static async restoreHDWallet(mnemonic: string, passphrase: string = ''): Promise<HDWallet> {
    await this.ensureInitialized();

    try {
      // Validate mnemonic first
      if (!validateMnemonic(mnemonic, wordlist)) {
        throw WalletError.MnemonicInvalid();
      }

      // Generate seed from mnemonic
      const seedBytes = mnemonicToSeedSync(mnemonic, passphrase);

      // Create HDKey from seed for BIP32/BIP44 derivation
      const hdKey = HDKey.fromMasterSeed(seedBytes);

      return new NativeHDWallet(mnemonic, hdKey);
    } catch (error) {
      throw WalletError.MnemonicInvalid({ cause: error });
    }
  }

  /**
   * Validate mnemonic phrase
   */
  static async validateMnemonic(mnemonic: string): Promise<boolean> {
    return validateMnemonic(mnemonic, wordlist);
  }

  /**
   * Validate individual mnemonic word
   */
  static async validateWord(word: string): Promise<boolean> {
    return wordlist.includes(word.toLowerCase());
  }

  /**
   * Get word suggestions for auto-complete
   */
  static async suggestWords(prefix: string): Promise<string> {
    const suggestions = wordlist.filter((w) => w.startsWith(prefix.toLowerCase()));
    return suggestions.join(' ');
  }

  /**
   * Get Ethereum address
   * Note: Address derivation requires additional crypto libraries
   */
  static async deriveEVMAddress(wallet: HDWallet): Promise<string> {
    throw WalletError.UnsupportedOperation({
      details: {
        method: 'deriveEVMAddress',
        platform: 'react-native',
        reason: 'Use native bridge for key derivation',
      },
    });
  }

  /**
   * Clean up wallet resource
   */
  static deleteWallet(wallet: any): void {
    if (wallet && typeof wallet.delete === 'function') {
      wallet.delete();
    }
  }

  /**
   * Get version
   */
  static async getVersion(): Promise<string> {
    return '0.1.0-rn';
  }

  /**
   * Convert hex string to bytes
   */
  static async hexToBytes(hex: string): Promise<Uint8Array> {
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
    }
    return bytes;
  }

  /**
   * Convert bytes to hex string
   */
  static async bytesToHex(bytes: Uint8Array): Promise<string> {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Hash data using SHA2-256
   * Note: For React Native, you may need to use a JS crypto library
   */
  static async hashSHA256(data: Uint8Array): Promise<Uint8Array> {
    throw WalletError.UnsupportedOperation({
      details: { method: 'hashSHA256', platform: 'react-native' },
    });
  }

  /**
   * Hash data using SHA3-256
   */
  static async hashSHA3(data: Uint8Array): Promise<Uint8Array> {
    throw WalletError.UnsupportedOperation({
      details: { method: 'hashSHA3', platform: 'react-native' },
    });
  }

  // Stub methods for compatibility - these aren't needed for basic mnemonic generation
  static async getCore(): Promise<any> {
    throw WalletError.UnsupportedOperation({
      details: { method: 'getCore', platform: 'react-native' },
    });
  }

  /**
   * Get private key by signature algorithm for Flow (matches web implementation)
   * @param wallet - HD wallet instance
   * @param signatureAlgorithm - 'ECDSA_P256' or 'ECDSA_secp256k1'
   * @param derivationPath - BIP44 derivation path (default: m/44'/539'/0'/0/0 for Flow)
   * @returns PrivateKey with private key bytes and public key
   */
  static async getFlowPrivateKeyBySignatureAlgorithm(
    wallet: HDWallet,
    signatureAlgorithm: string,
    derivationPath: string = "m/44'/539'/0'/0/0"
  ): Promise<PrivateKey> {
    await this.ensureInitialized();

    try {
      // Map signature algorithm to Trust Wallet Core curve
      let curve: any;
      if (signatureAlgorithm === 'ECDSA_P256') {
        curve = 'nist256p1'; // or 1
      } else if (signatureAlgorithm === 'ECDSA_secp256k1') {
        curve = 'secp256k1'; // or 0
      } else {
        throw WalletError.UnsupportedSignatureAlgorithm({
          details: { signatureAlgorithm },
        });
      }

      // Use wallet's getKeyByCurve method
      return wallet.getKeyByCurve(curve, derivationPath);
    } catch (error) {
      if (error instanceof Error && error.message.includes('UnsupportedSignatureAlgorithm')) {
        throw error;
      }
      throw WalletError.DerivationFailed({ cause: error, details: { derivationPath } });
    }
  }

  static async getEVMPrivateKeyBySignatureAlgorithm(): Promise<any> {
    throw WalletError.UnsupportedOperation({
      details: { method: 'getEVMPrivateKeyBySignatureAlgorithm', platform: 'react-native' },
    });
  }

  /**
   * Get public key by signature algorithm for Flow (matches web implementation)
   * @param wallet - HD wallet instance
   * @param signatureAlgorithm - 'ECDSA_P256' or 'ECDSA_secp256k1'
   * @param derivationPath - BIP44 derivation path (default: m/44'/539'/0'/0/0 for Flow)
   * @returns Public key as hex string (without 0x04 prefix)
   */
  static async getFlowPublicKeyBySignatureAlgorithm(
    wallet: HDWallet,
    signatureAlgorithm: string,
    derivationPath: string = "m/44'/539'/0'/0/0"
  ): Promise<string> {
    // Get private key (which also computes the public key)
    const privateKey = await this.getFlowPrivateKeyBySignatureAlgorithm(
      wallet,
      signatureAlgorithm,
      derivationPath
    );

    try {
      // Get public key based on signature algorithm
      let publicKey: PublicKey;
      if (signatureAlgorithm === 'ECDSA_P256') {
        publicKey = privateKey.getPublicKeyNist256p1();
      } else if (signatureAlgorithm === 'ECDSA_secp256k1') {
        publicKey = privateKey.getPublicKeySecp256k1(false); // false = uncompressed
      } else {
        throw WalletError.UnsupportedSignatureAlgorithm({
          details: { signatureAlgorithm },
        });
      }

      try {
        // Get uncompressed public key bytes
        const publicKeyBytes = publicKey.uncompressed().data();

        // Convert to hex
        const publicKeyHex = Array.from(publicKeyBytes)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

        // Remove '04' prefix if present (matches iOS/web format() method)
        // Uncompressed public keys start with 04, but Flow expects the key without this prefix
        return publicKeyHex.startsWith('04') ? publicKeyHex.slice(2) : publicKeyHex;
      } finally {
        // Cleanup public key
        if (publicKey && typeof publicKey.delete === 'function') {
          publicKey.delete();
        }
      }
    } finally {
      // Cleanup private key
      if (privateKey && typeof privateKey.delete === 'function') {
        privateKey.delete();
      }
    }
  }

  static async getEVMPublicKeyBySignatureAlgorithm(): Promise<string> {
    throw WalletError.UnsupportedOperation({
      details: { method: 'getEVMPublicKeyBySignatureAlgorithm', platform: 'react-native' },
    });
  }

  static async createPrivateKeyFromBytes(): Promise<any> {
    throw WalletError.UnsupportedOperation({
      details: { method: 'createPrivateKeyFromBytes', platform: 'react-native' },
    });
  }

  static async signWithPrivateKey(): Promise<Uint8Array> {
    throw WalletError.UnsupportedOperation({
      details: { method: 'signWithPrivateKey', platform: 'react-native' },
    });
  }

  static async pbkdf2(): Promise<Uint8Array> {
    throw WalletError.UnsupportedOperation({
      details: { method: 'pbkdf2', platform: 'react-native' },
    });
  }

  static async aesEncrypt(): Promise<Uint8Array> {
    throw WalletError.UnsupportedOperation({
      details: { method: 'aesEncrypt', platform: 'react-native' },
    });
  }

  static async aesDecrypt(): Promise<Uint8Array> {
    throw WalletError.UnsupportedOperation({
      details: { method: 'aesDecrypt', platform: 'react-native' },
    });
  }
}
