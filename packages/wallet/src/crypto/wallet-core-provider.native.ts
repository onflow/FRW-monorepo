/**
 * React Native implementation of Trust Wallet Core integration for FRW
 * Uses pure JavaScript crypto libraries (@scure/bip39, @scure/bip32, @noble/curves)
 */

import { p256 } from '@noble/curves/p256';
import { secp256k1 } from '@noble/curves/secp256k1';
import { HDKey } from '@scure/bip32';
import { generateMnemonic, validateMnemonic, mnemonicToSeedSync } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

import { WalletError } from '../types/errors';

// Mock types to match the web implementation interface
interface MockHDWallet {
  mnemonic: string;
  seed: string;
  hdKey: HDKey; // BIP32 HD key for derivation
  delete(): void;
}

interface MockPrivateKey {
  data(): Uint8Array;
  publicKey: Uint8Array; // Store public key for later use
  delete(): void;
}

/**
 * Wallet Core provider with Flow blockchain extensions (React Native)
 */
export class WalletCoreProvider {
  private static initialized = false;
  private static currentWallet: { mnemonic: string; seed: string } | null = null;

  /**
   * Initialize - no-op for React Native (native module is always ready)
   */
  static async initialize(): Promise<void> {
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
    wallet: MockHDWallet;
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
      const seed = Array.from(seedBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      // Create HDKey from seed for BIP32/BIP44 derivation
      const hdKey = HDKey.fromMasterSeed(seedBytes);

      this.currentWallet = { mnemonic, seed };

      const wallet: MockHDWallet = {
        mnemonic,
        seed,
        hdKey,
        delete: () => {
          // Cleanup
          this.currentWallet = null;
        },
      };

      return { wallet, mnemonic };
    } catch (error) {
      throw WalletError.InitializationFailed({ cause: error });
    }
  }

  /**
   * Restore HD wallet from mnemonic
   */
  static async restoreHDWallet(mnemonic: string, passphrase: string = ''): Promise<MockHDWallet> {
    await this.ensureInitialized();

    try {
      // Validate mnemonic first
      if (!validateMnemonic(mnemonic, wordlist)) {
        throw WalletError.MnemonicInvalid();
      }

      // Generate seed from mnemonic
      const seedBytes = mnemonicToSeedSync(mnemonic, passphrase);
      const seed = Array.from(seedBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      // Create HDKey from seed for BIP32/BIP44 derivation
      const hdKey = HDKey.fromMasterSeed(seedBytes);

      this.currentWallet = { mnemonic, seed };

      const wallet: MockHDWallet = {
        mnemonic,
        seed,
        hdKey,
        delete: () => {
          this.currentWallet = null;
        },
      };

      return wallet;
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
  static async deriveEVMAddress(wallet: MockHDWallet): Promise<string> {
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
   * @returns MockPrivateKey with private key bytes and public key
   */
  static async getFlowPrivateKeyBySignatureAlgorithm(
    wallet: MockHDWallet,
    signatureAlgorithm: string,
    derivationPath: string = "m/44'/539'/0'/0/0"
  ): Promise<MockPrivateKey> {
    await this.ensureInitialized();

    try {
      // Derive child key at the specified path
      const derivedKey = wallet.hdKey.derive(derivationPath);

      if (!derivedKey.privateKey) {
        throw WalletError.KeyNotInitialized({ details: { derivationPath } });
      }

      const privateKeyBytes = derivedKey.privateKey;

      // Get public key based on the signature algorithm
      let publicKeyBytes: Uint8Array;

      switch (signatureAlgorithm) {
        case 'ECDSA_P256': {
          // P-256 (NIST P-256, secp256r1) - Flow's default
          const publicKey = p256.getPublicKey(privateKeyBytes, false); // false = uncompressed
          publicKeyBytes = publicKey;
          break;
        }
        case 'ECDSA_secp256k1': {
          // secp256k1 - Bitcoin/Ethereum curve
          const publicKey = secp256k1.getPublicKey(privateKeyBytes, false); // false = uncompressed
          publicKeyBytes = publicKey;
          break;
        }
        default:
          throw WalletError.UnsupportedSignatureAlgorithm({
            details: { signatureAlgorithm },
          });
      }

      const privateKey: MockPrivateKey = {
        data: () => privateKeyBytes,
        publicKey: publicKeyBytes,
        delete: () => {
          // Cleanup (no-op for pure JS)
        },
      };

      return privateKey;
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
    wallet: MockHDWallet,
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
      // Get uncompressed public key bytes
      const publicKeyBytes = privateKey.publicKey;

      // Convert to hex
      const publicKeyHex = Array.from(publicKeyBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      // Remove '04' prefix if present (matches iOS/web format() method)
      // Uncompressed public keys start with 04, but Flow expects the key without this prefix
      return publicKeyHex.startsWith('04') ? publicKeyHex.slice(2) : publicKeyHex;
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
