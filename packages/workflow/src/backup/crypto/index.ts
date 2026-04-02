import { BackupVersion, type BackupCrypto } from '../types';
import { KeystoreCrypto } from './keystore-crypto';
import { LegacyCrypto } from './legacy-crypto';

export { LegacyCrypto } from './legacy-crypto';
export { KeystoreCrypto } from './keystore-crypto';

/** @param legacyIV — Required when creating V1 crypto. The fixed IV from platform config. */
export function createBackupCrypto(version: BackupVersion, legacyIV?: string): BackupCrypto {
  switch (version) {
    case BackupVersion.V1:
      return new LegacyCrypto(legacyIV);
    case BackupVersion.V2:
      return new KeystoreCrypto();
  }
}

export function detectCryptoVersion(data: string): BackupVersion {
  try {
    const parsed = JSON.parse(data);
    if (parsed?.version === 3 && parsed?.crypto) {
      return BackupVersion.V2;
    }
  } catch {
    // Not JSON — legacy hex format
  }
  return BackupVersion.V1;
}
