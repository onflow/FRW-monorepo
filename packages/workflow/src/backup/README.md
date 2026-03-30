# @onflow/frw-workflow/backup

Unified backup/restore module for the Flow Reference Wallet. Shared across iOS,
Android, and Chrome Extension.

## Architecture

```
backup/
├── types.ts                    # Enums, interfaces, error types
├── crypto/                     # Encryption layer
│   ├── legacy-crypto.ts        # V1: AES-CBC fixed IV (decrypt-only)
│   └── keystore-crypto.ts      # V2: scrypt + aes-128-ctr + keccak256 MAC
├── providers/                  # Cloud storage
│   ├── google-drive.ts         # Google Drive REST API
│   └── dropbox.ts              # Dropbox HTTP API
├── migration/                  # V1 → V2 migration
├── device/                     # WalletConnect device sync
├── backup-workflow.ts          # Orchestrator (main entry point)
└── index.ts                    # Public API
```

## Quick Start

### Extension Setup

```typescript
import {
  BackupWorkflow,
  GoogleDriveProvider,
  DropboxProvider,
  CloudProvider,
  KeyWeight,
} from '@onflow/frw-workflow';

// 1. Create providers
const googleDrive = new GoogleDriveProvider({
  getAuthToken: (interactive) => chrome.identity.getAuthToken({ interactive }),
  legacyBackupName: 'lilico_backup',
  backupName: 'frw_backup_v2',
  legacyAesKey: process.env.BACKUP_AES_KEY,
  legacyIV: process.env.BACKUP_IV,
});

const dropbox = new DropboxProvider({
  getAuthToken: async () => getDropboxToken(),
  legacyBackupPath: '/lilico_backup.json',
  backupPath: '/frw_backup_v2.json',
  legacyAesKey: process.env.BACKUP_AES_KEY,
  legacyIV: process.env.BACKUP_IV,
});

// 2. Create workflow
const backupWorkflow = new BackupWorkflow({
  providers: new Map([
    [CloudProvider.GoogleDrive, googleDrive],
    [CloudProvider.Dropbox, dropbox],
  ]),
  api: openapiService, // implements BackupApi interface
});
```

### React Native Setup

```typescript
import {
  BackupWorkflow,
  GoogleDriveProvider,
  CloudProvider,
} from '@onflow/frw-workflow';
import { Platform } from 'react-native';

const backupWorkflow = new BackupWorkflow({
  providers: new Map([
    [
      CloudProvider.GoogleDrive,
      new GoogleDriveProvider({
        /* ... */
      }),
    ],
  ]),
  api: profileService(),
});

// iOS: register iCloud provider via native bridge
if (Platform.OS === 'ios') {
  backupWorkflow.registerProvider(createICloudBridgeProvider(bridge));
}
```

## Usage Examples

### Create a Backup

```typescript
const result = await backupWorkflow.createBackup({
  mnemonic: 'abandon abandon abandon ...',
  password: 'user-password',
  username: 'alice',
  uid: 'firebase-uid-123',
  keyWeight: KeyWeight.Full, // 1000 for legacy, 500 for multi-backup
  provider: CloudProvider.GoogleDrive,
});

if (result.success) {
  console.log('Backup saved and registered');
} else if (result.error === BackupErrorCode.ApiRegistrationFailed) {
  console.log(
    'Backup saved to cloud, but backend registration failed — retry later'
  );
}
```

### Restore a Backup

```typescript
import { BackupError, BackupErrorCode } from '@onflow/frw-workflow';

try {
  const { mnemonic, version, keyWeight } = await backupWorkflow.restoreBackup({
    username: 'alice',
    password: 'user-password',
    provider: CloudProvider.GoogleDrive,
  });

  // version tells you if it was V1 (legacy) or V2 (keystore v3)
  // keyWeight tells you 1000 (full) or 500 (partial)
  console.log(`Restored ${version} backup, key weight: ${keyWeight}`);
} catch (err) {
  if (err instanceof BackupError) {
    switch (err.code) {
      case BackupErrorCode.IncorrectPassword:
        showError('Wrong password');
        break;
      case BackupErrorCode.NotFound:
        showError('No backup found');
        break;
    }
  }
}
```

### List Backups

```typescript
const entries = await backupWorkflow.listBackups(CloudProvider.GoogleDrive);

for (const entry of entries) {
  console.log(
    `${entry.username} — ${entry.version} — weight: ${entry.keyWeight}`
  );
}
```

### Check if Backup Exists

```typescript
const exists = await backupWorkflow.hasBackup(
  CloudProvider.GoogleDrive,
  'alice'
);
```

### Verify Password (Without Decrypting)

```typescript
const isCorrect = await backupWorkflow.verifyPassword(
  CloudProvider.GoogleDrive,
  'alice',
  'user-password'
);
```

### Change Password

```typescript
// Re-encrypts all specified entries with the new password.
// V1 entries are automatically upgraded to V2 (implicit migration).
const { updated, failed } = await backupWorkflow.changePassword({
  provider: CloudProvider.GoogleDrive,
  oldPassword: 'old-password',
  newPassword: 'new-password',
  usernames: ['alice', 'bob'],
});

console.log(`Updated: ${updated.join(', ')}`);
if (failed.length > 0) {
  console.log(`Failed (wrong old password?): ${failed.join(', ')}`);
}
```

### Migrate V1 to V2

```typescript
// Explicit migration — re-encrypts V1 entries as V2 keystore v3.
// Non-destructive: entries with wrong password are left unchanged.
const result = await backupWorkflow.migrateToV2({
  provider: googleDrive,
  password: 'user-password',
  usernames: ['alice'], // optional — omit to migrate all
});

console.log(`Migrated: ${result.migrated}`);
console.log(`Skipped (already V2): ${result.skipped}`);
console.log(`Failed (wrong password): ${result.failed}`);
```

### Detect Key Weight Type

```typescript
// Query on-chain keys to determine 1000 (full/legacy) vs 500 (multi-backup)
const keyWeight = await backupWorkflow.detectKeyWeightType('0x1234abcd');
```

### Get Backup Status Across All Providers

```typescript
const statuses = await backupWorkflow.getAllBackupStatuses();

for (const [username, status] of statuses) {
  console.log(
    `${username}: ${status.providers.join(', ')} — ${status.version}`
  );
}
```

### Delete a Backup

```typescript
await backupWorkflow.deleteBackup(CloudProvider.GoogleDrive, 'alice');
```

### Device-to-Device Sync (WalletConnect)

```typescript
import { SyncRole, KeyWeight } from '@onflow/frw-workflow';

// Sender (existing device)
const session = await backupWorkflow.startDeviceSync({
  role: SyncRole.Sender,
  events: {
    onPaired: (peerId) => console.log(`Paired with ${peerId}`),
    onPayloadReceived: () => {},
    onError: (err) => console.error(err),
    onDisconnected: () => console.log('Done'),
  },
  pairingTimeout: 120000,
});

// Show QR code with session.uri for the receiver to scan
showQRCode(session.uri);

// After pairing, send the backup
await session.sendBackup({
  data: encryptedKeystoreJson, // Always V2 format
  username: 'alice',
  uid: 'firebase-uid',
  keyWeight: KeyWeight.Full,
  deviceInfo: { id: 'device-1', name: 'iPhone 15', platform: 'ios' },
});

await session.disconnect();
```

```typescript
// Receiver (new device)
const session = await backupWorkflow.startDeviceSync({
  role: SyncRole.Receiver,
  events: {
    onPaired: (peerId) => console.log(`Connected to ${peerId}`),
    onPayloadReceived: async (payload) => {
      // Decrypt and import the backup
      const crypto = createBackupCrypto(BackupVersion.V2);
      const mnemonic = await crypto.decrypt(payload.data, userPassword);
      await importWallet(mnemonic, payload.keyWeight);
    },
    onError: (err) => console.error(err),
    onDisconnected: () => console.log('Done'),
  },
});

// Scan QR and pair
await session.pair(scannedUri);
```

## Implementing a Custom CloudStorageProvider

For platforms with native-only APIs (e.g. iCloud on iOS):

```typescript
import type {
  CloudStorageProvider,
  BackupEntry,
  CloudProvider,
} from '@onflow/frw-workflow';

class ICloudProvider implements CloudStorageProvider {
  readonly provider = CloudProvider.ICloud;

  async hasPermission(): Promise<boolean> {
    return await bridge.call('icloud.hasPermission');
  }

  async authorize(interactive?: boolean): Promise<string> {
    return await bridge.call('icloud.authorize', { interactive });
  }

  async loadBackups(): Promise<BackupEntry[]> {
    return await bridge.call('icloud.loadBackups');
  }

  async saveBackups(entries: BackupEntry[]): Promise<void> {
    await bridge.call('icloud.saveBackups', { entries });
  }

  async deleteAll(): Promise<void> {
    await bridge.call('icloud.deleteAll');
  }
}

// Register at runtime
backupWorkflow.registerProvider(new ICloudProvider());
```

## Implementing BackupApi

The `BackupApi` interface connects to your backend:

```typescript
import type { BackupApi } from '@onflow/frw-workflow';

const api: BackupApi = {
  async registerBackup(backupInfo) {
    await fetch('/api/backup/register', {
      method: 'POST',
      body: JSON.stringify(backupInfo),
    });
  },

  async syncDeviceKey(accountKey, signatures) {
    await fetch('/api/keys/sync', {
      method: 'POST',
      body: JSON.stringify({ accountKey, signatures }),
    });
  },

  async getUserKeys() {
    const res = await fetch('/api/keys');
    return res.json();
  },
};
```

## Encryption Versions

| Version    | Format           | Algorithm                                     | Status                             |
| ---------- | ---------------- | --------------------------------------------- | ---------------------------------- |
| V1 (`1.0`) | Hex string       | AES-CBC, fixed IV, password as key            | Decrypt-only (read legacy backups) |
| V2 (`2.0`) | Keystore v3 JSON | scrypt (N=8192) + aes-128-ctr + keccak256 MAC | Active (all new backups)           |

V2 uses random salt and IV per encryption, providing proper semantic security.
The scrypt N=8192 parameter is chosen for mobile performance while maintaining
adequate brute-force resistance.

## Error Handling

All errors are `BackupError` instances with a structured `code`:

| Code                      | When                                                                 |
| ------------------------- | -------------------------------------------------------------------- |
| `INCORRECT_PASSWORD`      | Password doesn't match (V2: MAC mismatch, V1: bip39 validation fail) |
| `AUTH_FAILED`             | Cloud provider auth failed or expired                                |
| `NETWORK_ERROR`           | Network error during cloud operation                                 |
| `RATE_LIMITED`            | Cloud provider rate limit (429)                                      |
| `CORRUPT_DATA`            | Backup data unparseable                                              |
| `NOT_FOUND`               | No backup for given username/uid                                     |
| `PROVIDER_NOT_REGISTERED` | Provider not in workflow's provider map                              |
| `API_REGISTRATION_FAILED` | Backend API failed (backup itself succeeded)                         |
| `PAIRING_TIMEOUT`         | WalletConnect pairing timed out                                      |
| `UNKNOWN`                 | Unexpected error                                                     |
