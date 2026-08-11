import { describe, it, expect } from 'vitest';

import { createBackupCrypto, detectCryptoVersion } from '../../../src/backup/crypto';
import { KeystoreCrypto } from '../../../src/backup/crypto/keystore-crypto';
import { LegacyCrypto } from '../../../src/backup/crypto/legacy-crypto';
import { BackupVersion } from '../../../src/backup/types';

describe('createBackupCrypto', () => {
  it('returns LegacyCrypto for V1', () => {
    const crypto = createBackupCrypto(BackupVersion.V1);
    expect(crypto).toBeInstanceOf(LegacyCrypto);
  });

  it('returns KeystoreCrypto for V2', () => {
    const crypto = createBackupCrypto(BackupVersion.V2);
    expect(crypto).toBeInstanceOf(KeystoreCrypto);
  });
});

describe('detectCryptoVersion', () => {
  it('detects V2 from keystore v3 JSON', () => {
    const keystoreJson = JSON.stringify({
      version: 3,
      crypto: { cipher: 'aes-128-ctr' },
    });
    expect(detectCryptoVersion(keystoreJson)).toBe(BackupVersion.V2);
  });

  it('detects V1 from hex string', () => {
    expect(detectCryptoVersion('a1b2c3d4e5f6')).toBe(BackupVersion.V1);
  });

  it('detects V1 from invalid JSON', () => {
    expect(detectCryptoVersion('not-json-at-all')).toBe(BackupVersion.V1);
  });

  it('detects V1 from JSON without crypto field', () => {
    expect(detectCryptoVersion(JSON.stringify({ version: 3 }))).toBe(BackupVersion.V1);
  });
});
