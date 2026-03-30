import { keccak256 } from '@ethersproject/keccak256';
import aesjs from 'aes-js';
import { scrypt } from 'scrypt-js';
import { v4 as uuidv4 } from 'uuid';

import {
  BackupVersion,
  BackupError,
  BackupErrorCode,
  type BackupCrypto,
  type KeystoreV3,
} from '../types';

const SCRYPT_N = 8192;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const DKLEN = 32;

/**
 * V2 encryption: Ethereum keystore v3 format.
 * scrypt KDF + aes-128-ctr + keccak256 MAC.
 */
export class KeystoreCrypto implements BackupCrypto {
  readonly version = BackupVersion.V2;

  async encrypt(mnemonic: string, password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(32));
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const derivedKey = await this.deriveKey(password, salt);

    // aes-128-ctr: use first 16 bytes of derived key
    const aesCtr = new aesjs.ModeOfOperation.ctr(derivedKey.slice(0, 16), new aesjs.Counter(iv));
    const ciphertext = aesCtr.encrypt(new TextEncoder().encode(mnemonic));

    // MAC: keccak256(derivedKey[16:32] + ciphertext)
    const macInput = new Uint8Array(16 + ciphertext.length);
    macInput.set(derivedKey.slice(16, 32), 0);
    macInput.set(ciphertext, 16);
    const mac = keccak256(macInput);

    const keystore: KeystoreV3 = {
      version: 3,
      id: uuidv4(),
      crypto: {
        cipher: 'aes-128-ctr',
        ciphertext: aesjs.utils.hex.fromBytes(ciphertext),
        cipherparams: { iv: aesjs.utils.hex.fromBytes(iv) },
        kdf: 'scrypt',
        kdfparams: {
          dklen: DKLEN,
          n: SCRYPT_N,
          r: SCRYPT_R,
          p: SCRYPT_P,
          salt: aesjs.utils.hex.fromBytes(salt),
        },
        mac: mac.slice(2), // remove '0x' prefix
      },
    };

    return JSON.stringify(keystore);
  }

  async decrypt(keystoreJson: string, password: string): Promise<string> {
    const keystore = this.parseKeystore(keystoreJson);
    const derivedKey = await this.deriveKey(
      password,
      aesjs.utils.hex.toBytes(keystore.crypto.kdfparams.salt)
    );

    // Verify MAC
    const ciphertextBytes = aesjs.utils.hex.toBytes(keystore.crypto.ciphertext);
    if (!this.verifyMac(derivedKey, ciphertextBytes, keystore.crypto.mac)) {
      throw new BackupError(BackupErrorCode.IncorrectPassword, 'Incorrect password (MAC mismatch)');
    }

    // Decrypt
    const iv = aesjs.utils.hex.toBytes(keystore.crypto.cipherparams.iv);
    const aesCtr = new aesjs.ModeOfOperation.ctr(derivedKey.slice(0, 16), new aesjs.Counter(iv));
    const decryptedBytes = aesCtr.decrypt(ciphertextBytes);
    return new TextDecoder().decode(decryptedBytes);
  }

  async verifyPassword(keystoreJson: string, password: string): Promise<boolean> {
    try {
      const keystore = this.parseKeystore(keystoreJson);
      const derivedKey = await this.deriveKey(
        password,
        aesjs.utils.hex.toBytes(keystore.crypto.kdfparams.salt)
      );
      const ciphertextBytes = aesjs.utils.hex.toBytes(keystore.crypto.ciphertext);
      return this.verifyMac(derivedKey, ciphertextBytes, keystore.crypto.mac);
    } catch {
      return false;
    }
  }

  private async deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
    const passwordBytes = new TextEncoder().encode(password);
    const key = await scrypt(passwordBytes, salt, SCRYPT_N, SCRYPT_R, SCRYPT_P, DKLEN);
    return new Uint8Array(key);
  }

  private verifyMac(derivedKey: Uint8Array, ciphertext: Uint8Array, expectedMac: string): boolean {
    const macInput = new Uint8Array(16 + ciphertext.length);
    macInput.set(derivedKey.slice(16, 32), 0);
    macInput.set(ciphertext, 16);
    const computedMac = keccak256(macInput).slice(2); // remove '0x'
    return computedMac === expectedMac;
  }

  private parseKeystore(json: string): KeystoreV3 {
    try {
      const parsed = JSON.parse(json);
      if (parsed?.version !== 3 || !parsed?.crypto) {
        throw new Error('Invalid keystore format');
      }
      return parsed as KeystoreV3;
    } catch (e) {
      throw new BackupError(BackupErrorCode.CorruptData, 'Invalid keystore v3 JSON', e);
    }
  }
}
