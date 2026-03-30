import * as bip39 from 'bip39';

import { createBackupCrypto } from '../crypto';
import {
  BackupVersion,
  type BackupEntry,
  type MigrationOptions,
  type MigrationResult,
} from '../types';

export async function migrateV1ToV2(options: MigrationOptions): Promise<MigrationResult> {
  const { provider, password, usernames } = options;
  const result: MigrationResult = { migrated: [], failed: [], skipped: [] };

  const entries = await provider.loadBackups();
  const legacyCrypto = createBackupCrypto(BackupVersion.V1);
  const keystoreCrypto = createBackupCrypto(BackupVersion.V2);

  const updatedEntries: BackupEntry[] = [];

  for (const entry of entries) {
    if (entry.version === BackupVersion.V2) {
      result.skipped.push(entry.username);
      updatedEntries.push(entry);
      continue;
    }

    if (usernames && !usernames.includes(entry.username)) {
      updatedEntries.push(entry);
      continue;
    }

    try {
      const mnemonic = await legacyCrypto.decrypt(entry.data, password);
      // LegacyCrypto doesn't authenticate, so validate with bip39
      if (!bip39.validateMnemonic(mnemonic)) {
        result.failed.push(entry.username);
        updatedEntries.push(entry);
        continue;
      }

      const keystoreData = await keystoreCrypto.encrypt(mnemonic, password);
      updatedEntries.push({
        ...entry,
        data: keystoreData,
        version: BackupVersion.V2,
        timestamp: Date.now(),
      });
      result.migrated.push(entry.username);
    } catch {
      result.failed.push(entry.username);
      updatedEntries.push(entry);
    }
  }

  if (result.migrated.length > 0) {
    await provider.saveBackups(updatedEntries);
  }

  return result;
}
