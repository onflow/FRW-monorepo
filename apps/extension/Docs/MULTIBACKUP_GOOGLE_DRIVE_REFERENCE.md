# Multi Backup – iOS vs Extension (Google Drive)

Reference for where iOS fetches multibackup and where the extension does the same.

---

## 1. File name

|              | iOS                                                                        | Extension                                                                     |
| ------------ | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Constant** | `MultiBackupManager.backupFileName` = `"outblock_multi_backup"`            | `WalletController.DEFAULT_MULTI_BACKUP_FILE_NAME` = `'outblock_multi_backup'` |
| **Location** | `FRW-iOS/FRW/Modules/MultiBackup/Manager/MultiBackupManager.swift` line 48 | `apps/extension/src/background/controller/wallet.ts` line 1615                |

---

## 2. Where iOS fetches multibackup

### 2.1 Entry point – get list from Drive

- **File:** `FRW-iOS/FRW/Modules/MultiBackup/Manager/Target/MultiBackupGoogleDriveTarget.swift`
- **Function:** `getCurrentDriveItems()` (lines 83–104)

Flow:

1. `api?.getFileId(fileName: MultiBackupManager.backupFileName)`
   → fileName = **`"outblock_multi_backup"`**
2. `api?.getFileData(fileId: fileId)`
   → raw file bytes
3. `String(data: data, encoding: .utf8)?.trim()` then trim `"`
   → hex string
4. `MultiBackupManager.shared.decryptHexString(fixedHexString)`
   → `[StoreItem]`

### 2.2 List files in appDataFolder (get file id)

- **File:** `FRW-iOS/FRW/Services/Manager/Backup/Helper/GoogleDriveAPI.swift`
- **Function:** `getFileId(fileName: String)` (lines 24–52)

- **API:** Drive v3 **files.list**
- **Params:**
  `spaces = "appDataFolder"`
  `fields = "nextPageToken, files(id, name)"`
  `pageSize = 10`
- **Logic:** Iterate `files`, return **first** file where `file.name == fileName`.
  iOS only looks for **one** name: `"outblock_multi_backup"`. No “second file” fallback.

### 2.3 Get file content by id

- **File:** same `GoogleDriveAPI.swift`
- **Function:** `getFileData(fileId: String)` (lines 54–72)

- **API:** Drive **files.get** with **media** (GTLRDriveQuery_FilesGet.queryForMedia(withFileId:))
- **Effect:** Raw response body (file content as Data).

### 2.4 Decrypt and decode

- **File:** `FRW-iOS/FRW/Modules/MultiBackup/Manager/MultiBackupManager.swift`
- **Functions:**
  - `decryptHexString(_ hexString:)` (lines 415–421)
    → `Data(hexString:)` then `decryptData(data)`
  - `decryptData(_ data:)` (lines 423–432)
    Uses `iv()` (from `backupAESKey` via `toPassword()` = first 16 chars of SHA256 hex),
    `WalletManager.decryptionAES(key: backupAESKey, iv:, data:)`,
    then `JSONDecoder().decode([StoreItem].self, from: jsonData)`.

- **IV:** `iv()` in same file (lines 393–400): `key.toPassword()` (first 16 chars of SHA256(key) hex).
- **String extension** `toPassword()` (lines 756–765): SHA256 of string, hex, take first 16 **characters**.

---

## 3. Where the extension fetches multibackup

### 3.1 Entry point – get account list for UI

- **File:** `apps/extension/src/background/controller/wallet.ts`
- **Functions:**
  - `loadBackupAccountsForMultiBackup` (lines 1625–1646)
  - `loadBackupAccountListsForMultiBackup` (lines 1648–1665)

Flow:

1. If `GD_MULTI_BACKUP_ID` → `googleDriveService.loadBackupMultiBackup(undefined, id)`.
2. Else `googleDriveService.loadBackupMultiBackup(name)` with `name = 'outblock_multi_backup'`.

No fallback to legacy: **outblock_backup** is legacy-only. Multi-backup uses only the file **outblock_multi_backup** (same as iOS).

### 3.2 Load and decrypt multibackup file

- **File:** `apps/extension/src/core/service/googleDrive.ts`
- **Function:** `loadBackupMultiBackup(backupNameOverride?, backupIdOverride?)` (lines 221–254)

Flow:

1. If `backupIdOverride`: set `this.fileId = backupIdOverride`.
2. Else:
   `listFiles(backupNameOverride)` (looks for `outblock_multi_backup` in appDataFolder).
   If no file → return `[]`.
   Else `this.fileId = files.id`.
3. `getFile(this.fileId)` → raw response text.
4. `parseGoogleText(text)` → hex string (trim, strip `"`, support JSON or raw hex).
5. `decrypt(parsedText, AES_KEY, ivIOS)` with `ivIOS = toPasswordIOS(AES_KEY)`.
6. `JSON.parse(decodeContent)` → `MultiBackupStoreItem[]`, map to `DriveItem[]`.

### 3.3 List files in appDataFolder (get file by name or list for “second file”)

- **File:** same `googleDrive.ts`
- **Functions:**
  - **listFiles(backupNameOverride?)** (lines 355–364)
    - **API:** `GET drive/v3/files/`
    - **Params:** `spaces: 'appDataFolder'`, `fields: 'nextPageToken, files(id, name)'`, `pageSize: '10'`
    - **Logic:** `(files ?? []).find(file => file.name === name)` → **first** match.
      Same directory and params as iOS; same name `outblock_multi_backup` when called for multibackup.

  - **listAppDataFilesForDebug()** (lines 403–411)
    Same API/params; returns all files `{ id, name }`.
    Used by `getSecondFileIdWithSameName`.

- **getSecondFileIdWithSameName(backupName?)** (lines 416–422)
  Uses `listAppDataFilesForDebug()`, filters `f.name === name` (`outblock_backup`), returns `sameName[1].id` (second file).
  This is extension-only (iOS has no “second file” fallback).

### 3.4 Get file content by id

- **File:** same `googleDrive.ts`
- **Function:** `getFile(fileId, tokenOverride?)` (lines 427–437)

- **API:** `GET drive/v3/files/{fileId}` with `alt: 'media'`.
- **Effect:** Raw response body (same as iOS getFileData).

### 3.5 Parse and decrypt

- **File:** same `googleDrive.ts`
- **parseGoogleText** (lines 152–171): trim, strip `"`, then either JSON `.hex` / value or raw hex.
- **toPasswordIOS** (lines 41–49): first 16 **characters** of SHA256(key) hex, UTF-8 bytes → IV (matches iOS `toPassword()` for IV).
- **decrypt(..., iv)** used with that IV and `AES_KEY` (GD_AES_KEY); then JSON.parse to `MultiBackupStoreItem[]`.

---

## 4. Summary

| Step            | iOS                                                                                 | Extension                                                                |
| --------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Directory**   | appDataFolder                                                                       | appDataFolder (`spaces: 'appDataFolder'`)                                |
| **List API**    | files.list, spaces=appDataFolder, fields=nextPageToken, files(id,name), pageSize=10 | Same: `GET drive/v3/files/` with same params                             |
| **File name**   | `"outblock_multi_backup"` only, first match                                         | `"outblock_multi_backup"` only, first match (no legacy fallback)         |
| **Get content** | files.get with media (by fileId)                                                    | Same: `GET drive/v3/files/{fileId}?alt=media`                            |
| **Decrypt**     | IV = first 16 chars of SHA256(key) hex; AES decrypt; JSON → [StoreItem]             | Same: toPasswordIOS(key), decrypt with IV, JSON → MultiBackupStoreItem[] |

So: **API and directory are the same.** Both use only the file **outblock_multi_backup** for multi-backup. Legacy backup uses **outblock_backup** (separate).
