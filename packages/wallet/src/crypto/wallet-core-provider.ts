/**
 * Trust Wallet Core integration for FRW
 * Based on analysis of Trust Wallet Core WASM tests and examples
 */

import { type WalletCore } from '@trustwallet/wallet-core';
import {
  type HDWallet,
  type PrivateKey,
  type PublicKey,
} from '@trustwallet/wallet-core/dist/src/wallet-core';
/**
 * Wallet Core provider with Flow blockchain extensions
 */
export class WalletCoreProvider {
  private static core: WalletCore | null = null;
  private static initialized = false;

  /**
   * Initialize Trust Wallet Core WASM module
   */
  static async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Dynamic import to avoid bundling issues
      const { initWasm } = await import('@trustwallet/wallet-core');

      // Initialize WASM module (based on initWasm.test.ts)
      this.core = await initWasm();

      if (!this.core) {
        throw new Error('Failed to initialize Wallet Core');
      }

      this.initialized = true;
    } catch (error) {
      throw new Error(`Wallet Core initialization failed: ${error}`);
    }
  }

  /**
   * Ensure core is initialized
   */
  private static async ensureInitialized(): Promise<WalletCore> {
    if (!this.initialized || !this.core) {
      await this.initialize();
    }
    return this.core!;
  }

  /**
   * Create HD wallet with mnemonic (based on HDWallet.test.ts)
   */
  static async createHDWallet(
    strength: number = 256,
    password: string = ''
  ): Promise<{
    wallet: HDWallet;
    mnemonic: string;
  }> {
    const core = await this.ensureInitialized();

    // Create HD wallet with specified entropy strength
    const wallet = core.HDWallet.create(strength, password);
    const mnemonic = wallet.mnemonic();

    // Validate mnemonic (based on Mnemonic.test.ts)
    if (!core.Mnemonic.isValid(mnemonic)) {
      wallet.delete();
      throw new Error('Generated invalid mnemonic');
    }

    return { wallet, mnemonic };
  }

  /**
   * Restore HD wallet from mnemonic
   */
  static async restoreHDWallet(mnemonic: string, password: string = ''): Promise<any> {
    const core = await this.ensureInitialized();

    // Validate mnemonic first
    if (!core.Mnemonic.isValid(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    // Create wallet from mnemonic (based on HDWallet.test.ts)
    const wallet = core.HDWallet.createWithMnemonic(mnemonic, password);

    return wallet;
  }

  /**
   * Validate mnemonic phrase
   */
  static async validateMnemonic(mnemonic: string): Promise<boolean> {
    const core = await this.ensureInitialized();
    return core.Mnemonic.isValid(mnemonic);
  }

  /**
   * Validate individual mnemonic word
   */
  static async validateWord(word: string): Promise<boolean> {
    const core = await this.ensureInitialized();
    return core.Mnemonic.isValidWord(word);
  }

  /**
   * Get word suggestions for auto-complete
   */
  static async suggestWords(prefix: string): Promise<string> {
    const core = await this.ensureInitialized();
    return core.Mnemonic.suggest(prefix);
  }

  /**
   * Get private key by signature algorithm for Flow (matches iOS implementation)
   */
  static async getFlowPrivateKeyBySignatureAlgorithm(
    wallet: HDWallet,
    signatureAlgorithm: string,
    derivationPath: string = "m/44'/539'/0'/0/0"
  ): Promise<PrivateKey> {
    const core = await this.ensureInitialized();

    switch (signatureAlgorithm) {
      case 'ECDSA_P256':
        // Use getKeyByCurve with Curve.nist256p1 for Flow P-256 (matches iOS implementation)
        return wallet.getKeyByCurve(core.Curve.nist256p1, derivationPath);
      case 'ECDSA_secp256k1':
        // Use getKeyByCurve with Curve.secp256k1 for Flow secp256k1 (matches iOS implementation)
        return wallet.getKeyByCurve(core.Curve.secp256k1, derivationPath);
      default:
        throw new Error(`Unsupported signature algorithm: ${signatureAlgorithm}`);
    }
  }

  /**
   * Get private key for EVM (separate from Flow)
   */
  static async getEVMPrivateKeyBySignatureAlgorithm(wallet: HDWallet): Promise<PrivateKey> {
    const core = await this.ensureInitialized();
    return wallet.getKeyForCoin(core.CoinType.ethereum);
  }

  /**
   * Get public key by signature algorithm for Flow (supports both P-256 and secp256k1)
   */
  static async getFlowPublicKeyBySignatureAlgorithm(
    wallet: HDWallet,
    signatureAlgorithm: string,
    derivationPath: string = "m/44'/539'/0'/0/0"
  ): Promise<string> {
    const core = await this.ensureInitialized();

    // Get private key using getKeyByCurve for Flow
    const privateKey = await this.getFlowPrivateKeyBySignatureAlgorithm(
      wallet,
      signatureAlgorithm,
      derivationPath
    );

    try {
      let publicKey: PublicKey;

      switch (signatureAlgorithm) {
        case 'ECDSA_P256':
          // Use getPublicKeyNist256p1 for P-256 curve
          publicKey = privateKey.getPublicKeyNist256p1();
          break;
        case 'ECDSA_secp256k1':
          // Use getPublicKeySecp256k1 with uncompressed format for Flow
          publicKey = privateKey.getPublicKeySecp256k1(false); // false = uncompressed
          break;
        default:
          throw new Error(`Unsupported Flow signature algorithm: ${signatureAlgorithm}`);
      }

      // Get uncompressed format and convert to hex
      const uncompressedData = publicKey.uncompressed
        ? publicKey.uncompressed().data()
        : publicKey.data();
      const publicKeyHex = core.HexCoding.encode(uncompressedData);

      // Remove '04' prefix if present (matches iOS format() method)
      return publicKeyHex.startsWith('04') ? publicKeyHex.slice(2) : publicKeyHex;
    } finally {
      // Secure cleanup of private key (matches iOS defer pattern)
      if (privateKey && typeof privateKey.delete === 'function') {
        privateKey.delete();
      }
    }
  }

  /**
   * Get public key for EVM (only supports secp256k1)
   */
  static async getEVMPublicKeyBySignatureAlgorithm(wallet: HDWallet): Promise<string> {
    // Get private key using getKeyForCoin for EVM
    const privateKey = await this.getEVMPrivateKeyBySignatureAlgorithm(wallet);

    try {
      // Get secp256k1 public key (uncompressed for Flow EVM)
      const publicKey = privateKey.getPublicKeySecp256k1(false); // false = uncompressed
      const publicKeyHex = await this.bytesToHex(publicKey.uncompressed().data());
      return publicKeyHex;
    } finally {
      // Secure cleanup of private key (matches iOS defer pattern)
      if (privateKey && typeof privateKey.delete === 'function') {
        privateKey.delete();
      }
    }
  }

  /**
   * Hash data using SHA2-256
   */
  static async hashSHA256(data: Uint8Array): Promise<Uint8Array> {
    const core = await this.ensureInitialized();

    const hashResult = core.Hash.sha256(data);
    return new Uint8Array(hashResult);
  }

  /**
   * Hash data using SHA3-256
   */
  static async hashSHA3(data: Uint8Array): Promise<Uint8Array> {
    const core = await this.ensureInitialized();

    const hashResult = core.Hash.sha3_256(data);
    return new Uint8Array(hashResult);
  }

  /**
   * PBKDF2 key derivation using HMAC-SHA256
   */
  static async pbkdf2(
    password: string,
    salt: Uint8Array,
    iterations: number,
    keyLength: number
  ): Promise<Uint8Array> {
    const core = await this.ensureInitialized();

    const passwordBytes = new TextEncoder().encode(password);
    const derivedKey = core.PBKDF2.hmacSha256(passwordBytes, salt, iterations, keyLength);
    return new Uint8Array(derivedKey);
  }

  /**
   * AES encryption
   */
  static async aesEncrypt(data: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
    const core = await this.ensureInitialized();

    const encrypted = core.AES.encryptCBC(key, data, iv, core.AESPaddingMode.pkcs7);
    return new Uint8Array(encrypted);
  }

  /**
   * AES decryption
   */
  static async aesDecrypt(
    encryptedData: Uint8Array,
    key: Uint8Array,
    iv: Uint8Array
  ): Promise<Uint8Array> {
    const core = await this.ensureInitialized();

    const decrypted = core.AES.decryptCBC(key, encryptedData, iv, core.AESPaddingMode.pkcs7);
    return new Uint8Array(decrypted);
  }

  /**
   * Convert hex string to bytes
   */
  static async hexToBytes(hex: string): Promise<Uint8Array> {
    const core = await this.ensureInitialized();

    const bytes = core.HexCoding.decode(hex);
    return new Uint8Array(bytes);
  }

  /**
   * Convert bytes to hex string
   */
  static async bytesToHex(bytes: Uint8Array): Promise<string> {
    const core = await this.ensureInitialized();

    return core.HexCoding.encode(bytes);
  }

  /**
   * Create PrivateKey object from raw bytes (matches iOS PrivateKey init)
   */
  static async createPrivateKeyFromBytes(privateKeyBytes: Uint8Array): Promise<PrivateKey> {
    const core = await this.ensureInitialized();

    // Create PrivateKey from raw bytes using createWithData (matches WalletCore API)
    const buffer = Buffer.from(privateKeyBytes);
    return core.PrivateKey.createWithData(buffer);
  }

  /**
   * Sign data with PrivateKey using specified curve (matches iOS signing pattern)
   */
  static async signWithPrivateKey(
    privateKeyBytes: Uint8Array,
    hashedData: Uint8Array,
    signatureAlgorithm: string
  ): Promise<Uint8Array> {
    const core = await this.ensureInitialized();

    // Create PrivateKey from bytes
    const privateKey = await this.createPrivateKeyFromBytes(privateKeyBytes);

    try {
      // Determine curve based on signature algorithm
      let curve: any;
      switch (signatureAlgorithm) {
        case 'ECDSA_P256':
          curve = core.Curve.nist256p1;
          break;
        case 'ECDSA_secp256k1':
          curve = core.Curve.secp256k1;
          break;
        default:
          throw new Error(`Unsupported signature algorithm: ${signatureAlgorithm}`);
      }

      // Sign the hashed data with the specified curve
      const signature = privateKey.sign(hashedData, curve);
      return new Uint8Array(signature);
    } finally {
      // Secure cleanup (matches iOS defer pattern)
      if (privateKey && typeof privateKey.delete === 'function') {
        privateKey.delete();
      }
    }
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
   * Get Trust Wallet Core version info
   */
  static async getVersion(): Promise<string> {
    const core = await this.ensureInitialized();

    // Wallet Core should provide version info
    return '0.1.0';
  }

  /**
   * Derive EVM address from HD wallet using WalletCore's standard API
   */
  static async deriveEVMAddress(wallet: HDWallet): Promise<string> {
    const core = await this.ensureInitialized();

    try {
      // Use WalletCore's direct method to get Ethereum address
      // This handles all the cryptographic operations internally
      return wallet.getAddressForCoin(core.CoinType.ethereum);
    } catch (error) {
      throw new Error(`Failed to derive EVM address: ${error}`);
    }
  }

  /**
   * Derive EVM address from private key bytes
   */
  static async deriveEVMAddressFromPrivateKey(privateKeyBytes: Uint8Array): Promise<string> {
    const core = await this.ensureInitialized();

    try {
      const privateKey = await this.createPrivateKeyFromBytes(privateKeyBytes);

      // Get public key from private key
      const publicKey = privateKey.getPublicKeySecp256k1(false); // uncompressed

      // Derive Ethereum address from public key
      const address = core.AnyAddress.createWithPublicKey(publicKey, core.CoinType.ethereum);

      // Clean up
      publicKey.delete();
      privateKey.delete();

      return address.description();
    } catch (error) {
      throw new Error(`Failed to derive EVM address from private key: ${error}`);
    }
  }
}
