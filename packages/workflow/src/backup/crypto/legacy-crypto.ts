import aesjs from 'aes-js';
import * as bip39 from 'bip39';

import { BackupVersion, type BackupCrypto } from '../types';

/**
 * V1 Legacy encryption: AES-CBC with fixed IV.
 * Ported from apps/extension/src/core/service/googleDrive.ts.
 *
 * This class is DECRYPT-ONLY for production use.
 * encrypt() throws — all new backups must use V2 (KeystoreCrypto).
 * encryptForTesting() is exposed only for test vector generation.
 */
export class LegacyCrypto implements BackupCrypto {
  readonly version = BackupVersion.V1;
  private readonly ivBytes: Uint8Array;

  /** @param iv — Fixed IV string from platform config (e.g. legacyIV). Falls back to zeros. */
  constructor(iv?: string) {
    this.ivBytes = iv ? aesjs.utils.utf8.toBytes(iv) : new Uint8Array(16);
  }

  async encrypt(_mnemonic: string, _password: string): Promise<string> {
    throw new Error('V1 encryption is deprecated. Use V2 (KeystoreCrypto) for new backups.');
  }

  async decrypt(encryptedHex: string, password: string): Promise<string> {
    return this.decryptSync(encryptedHex, password);
  }

  async verifyPassword(encryptedHex: string, password: string): Promise<boolean> {
    try {
      const mnemonic = this.decryptSync(encryptedHex, password);
      return bip39.validateMnemonic(mnemonic);
    } catch {
      return false;
    }
  }

  /** Exposed for testing only — generates V1 encrypted hex from mnemonic */
  encryptForTesting(mnemonic: string, password: string): string {
    const key = this.padKey(aesjs.utils.utf8.toBytes(password));
    const textBytes = aesjs.padding.pkcs7.pad(aesjs.utils.utf8.toBytes(mnemonic));
    const aesCbc = new aesjs.ModeOfOperation.cbc(key, this.ivBytes);
    const encryptedBytes = aesCbc.encrypt(textBytes);
    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private decryptSync(encryptedHex: string, password: string): string {
    const key = this.padKey(aesjs.utils.utf8.toBytes(password));
    const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
    // CBC requires a fresh instance per operation (stateful)
    const aesCbc = new aesjs.ModeOfOperation.cbc(key, new Uint8Array(this.ivBytes));
    const rawDecrypted = aesCbc.decrypt(encryptedBytes);
    // Invalid padding (wrong password) returns raw bytes rather than throwing,
    // so the caller gets garbage text that will fail mnemonic validation.
    let decryptedBytes: Uint8Array;
    try {
      decryptedBytes = aesjs.padding.pkcs7.strip(rawDecrypted);
    } catch {
      decryptedBytes = rawDecrypted;
    }
    return aesjs.utils.utf8.fromBytes(decryptedBytes).trim();
  }

  private padKey(arr: Uint8Array, len = 16): Uint8Array {
    return new Uint8Array([...arr, ...new Array(16).fill(0)]).slice(0, len);
  }
}
