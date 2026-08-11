import { describe, it, expect } from 'vitest';

import { KeystoreCrypto } from '../../../src/backup/crypto/keystore-crypto';
import { BackupVersion, type KeystoreV3 } from '../../../src/backup/types';

describe('KeystoreCrypto', () => {
  const crypto = new KeystoreCrypto();
  const TEST_MNEMONIC =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
  const TEST_PASSWORD = 'my-secure-password';

  it('has version V2', () => {
    expect(crypto.version).toBe(BackupVersion.V2);
  });

  it('encrypt() returns valid keystore v3 JSON', async () => {
    const result = await crypto.encrypt(TEST_MNEMONIC, TEST_PASSWORD);
    const keystore: KeystoreV3 = JSON.parse(result);

    expect(keystore.version).toBe(3);
    expect(keystore.crypto.cipher).toBe('aes-128-ctr');
    expect(keystore.crypto.kdf).toBe('scrypt');
    expect(keystore.crypto.kdfparams.dklen).toBe(32);
    expect(keystore.crypto.kdfparams.n).toBe(8192);
    expect(keystore.crypto.kdfparams.r).toBe(8);
    expect(keystore.crypto.kdfparams.p).toBe(1);
    expect(keystore.crypto.cipherparams.iv).toHaveLength(32); // 16 bytes hex
    expect(keystore.crypto.kdfparams.salt).toHaveLength(64); // 32 bytes hex
    expect(keystore.crypto.mac).toHaveLength(64); // 32 bytes hex
    expect(keystore.id).toBeTruthy();
  });

  it('encrypt + decrypt round-trip produces original mnemonic', async () => {
    const encrypted = await crypto.encrypt(TEST_MNEMONIC, TEST_PASSWORD);
    const decrypted = await crypto.decrypt(encrypted, TEST_PASSWORD);
    expect(decrypted).toBe(TEST_MNEMONIC);
  });

  it('each encrypt() produces different output (random salt + IV)', async () => {
    const a = await crypto.encrypt(TEST_MNEMONIC, TEST_PASSWORD);
    const b = await crypto.encrypt(TEST_MNEMONIC, TEST_PASSWORD);
    expect(a).not.toBe(b);

    const keystoreA: KeystoreV3 = JSON.parse(a);
    const keystoreB: KeystoreV3 = JSON.parse(b);
    expect(keystoreA.crypto.kdfparams.salt).not.toBe(keystoreB.crypto.kdfparams.salt);
    expect(keystoreA.crypto.cipherparams.iv).not.toBe(keystoreB.crypto.cipherparams.iv);
  });

  it('decrypt() with wrong password throws', async () => {
    const encrypted = await crypto.encrypt(TEST_MNEMONIC, TEST_PASSWORD);
    await expect(crypto.decrypt(encrypted, 'wrong-password')).rejects.toThrow();
  });

  it('verifyPassword() returns true for correct password', async () => {
    const encrypted = await crypto.encrypt(TEST_MNEMONIC, TEST_PASSWORD);
    expect(await crypto.verifyPassword(encrypted, TEST_PASSWORD)).toBe(true);
  });

  it('verifyPassword() returns false for wrong password', async () => {
    const encrypted = await crypto.encrypt(TEST_MNEMONIC, TEST_PASSWORD);
    expect(await crypto.verifyPassword(encrypted, 'wrong-password')).toBe(false);
  });

  it('verifyPassword() returns false for corrupt data', async () => {
    expect(await crypto.verifyPassword('not-json', TEST_PASSWORD)).toBe(false);
  });
});
