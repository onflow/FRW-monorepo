/**
 * React Native implementation of Trust Wallet Core integration for FRW
 * Uses @scure/bip39 pure JavaScript implementation (works universally)
 */

import { generateMnemonic, validateMnemonic, mnemonicToSeedSync } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

import { WalletError } from '../types/errors';

// Mock types to match the web implementation interface
interface MockHDWallet {
  mnemonic: string;
  seed: string;
  delete(): void;
}

interface MockPrivateKey {
  data(): Uint8Array;
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

      this.currentWallet = { mnemonic, seed };

      const wallet: MockHDWallet = {
        mnemonic,
        seed,
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

      this.currentWallet = { mnemonic, seed };

      const wallet: MockHDWallet = {
        mnemonic,
        seed,
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

  static async getFlowPrivateKeyBySignatureAlgorithm(): Promise<any> {
    throw WalletError.UnsupportedOperation({
      details: { method: 'getFlowPrivateKeyBySignatureAlgorithm', platform: 'react-native' },
    });
  }

  static async getEVMPrivateKeyBySignatureAlgorithm(): Promise<any> {
    throw WalletError.UnsupportedOperation({
      details: { method: 'getEVMPrivateKeyBySignatureAlgorithm', platform: 'react-native' },
    });
  }

  static async getFlowPublicKeyBySignatureAlgorithm(): Promise<string> {
    throw WalletError.UnsupportedOperation({
      details: { method: 'getFlowPublicKeyBySignatureAlgorithm', platform: 'react-native' },
    });
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
