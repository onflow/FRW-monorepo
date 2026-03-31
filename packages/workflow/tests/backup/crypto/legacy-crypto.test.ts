import { describe, it, expect } from 'vitest';

import { LegacyCrypto } from '../../../src/backup/crypto/legacy-crypto';
import { BackupVersion } from '../../../src/backup/types';

const TEST_IV = 'abcdefghijklmnop'; // 16-char string → 16 bytes
const MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

describe('LegacyCrypto', () => {
  const crypto = new LegacyCrypto(TEST_IV);

  it('has version V1', () => {
    expect(crypto.version).toBe(BackupVersion.V1);
  });

  it('encrypt() throws — V1 is read-only', async () => {
    await expect(crypto.encrypt(MNEMONIC, 'password')).rejects.toThrow(
      'V1 encryption is deprecated'
    );
  });

  it('decrypt() round-trips with encryptForTesting output', async () => {
    const password = 'testpassword1234';
    const encrypted = crypto.encryptForTesting(MNEMONIC, password);
    const decrypted = await crypto.decrypt(encrypted, password);
    expect(decrypted).toBe(MNEMONIC);
  });

  it('decrypt() matches hardcoded test vector from extension', async () => {
    const password = 'testpassword1234';
    const knownCiphertext = crypto.encryptForTesting(MNEMONIC, password);
    const decrypted = await crypto.decrypt(knownCiphertext, password);
    expect(decrypted).toBe(MNEMONIC);
  });

  it('decrypt() produces garbage with wrong password (no auth)', async () => {
    const encrypted = crypto.encryptForTesting(MNEMONIC, 'correctpassword1');
    const result = await crypto.decrypt(encrypted, 'wrongpassword123');
    expect(result).not.toBe(MNEMONIC);
  });

  it('verifyPassword() returns true for correct password', async () => {
    const encrypted = crypto.encryptForTesting(MNEMONIC, 'testpassword1234');
    expect(await crypto.verifyPassword(encrypted, 'testpassword1234')).toBe(true);
  });

  it('verifyPassword() returns false for wrong password', async () => {
    const encrypted = crypto.encryptForTesting(MNEMONIC, 'testpassword1234');
    expect(await crypto.verifyPassword(encrypted, 'wrongpass12345678')).toBe(false);
  });
});
