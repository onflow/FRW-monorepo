import aesjs from 'aes-js';
import * as bip39 from 'bip39';

import { seedWithPathAndPhrase2PublicPrivateKey } from '@/core/utils/modules/publicPrivateKey';
import {
  FLOW_BIP44_PATH,
  SIGN_ALGO_NUM_ECDSA_P256,
  SIGN_ALGO_NUM_ECDSA_secp256k1,
} from '@/shared/constant';
import { consoleError } from '@/shared/utils';

interface GoogleDriveFileModel {
  kind: string;
  id: string;
  name: string;
  mimeType: string;
}
interface DriveItem {
  username: string;
  data: string;
  version: string;
  uid: string | null;
  time: string | null;
  code?: string;
  /** Multi-backup (iOS) metadata (optional for legacy backups). */
  publicKey?: string;
  address?: string;
  keyIndex?: number;
  signAlgo?: number;
  hashAlgo?: number;
}

/**
 * iOS MultiBackupManager.StoreItem format (Google Drive multi-backup file).
 * File content is AES-encrypted JSON array of these items; IV = first 16 chars of SHA256(key) hex.
 */
export interface MultiBackupStoreItem {
  address: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  publicKey: string;
  data: string;
  keyIndex: number;
  signAlgo: number;
  hashAlgo: number;
  weight?: number;
  updatedTime?: number;
  deviceInfo?: unknown;
  code?: string;
  backupType?: string;
}

/** First 16 chars of SHA256(password) hex as UTF-8 bytes (16 bytes). Matches iOS toPassword() for IV. */
async function toPasswordIOS(password: string): Promise<Uint8Array> {
  const input = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', input);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const ivString = hashHex.slice(0, 16);
  return new TextEncoder().encode(ivString);
}

/** First 16 chars of SHA256(password) hex as string (matches iOS toPassword()). */
async function toPasswordString(password: string): Promise<string> {
  const input = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', input);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex.slice(0, 16);
}

// https://developers.google.com/drive/api/v3/reference/files/list
class GoogleDriveService {
  baseURL?: string;
  backupName?: string;
  appDataFolder?: string;
  scope?: string;
  AES_KEY?: string;
  IV?: Uint8Array;
  version = '1.0';
  getAuthTokenWrapper: (interactive?: boolean) => Promise<string> = async () => {
    throw new Error('getAuthTokenWrapper not implemented');
  };
  /** Optional. When set, used only for listFilesInDriveRoot (Multi Backup from mobile). */
  getAuthTokenWrapperWithDriveReadonly?: (interactive?: boolean) => Promise<string>;

  fileList: DriveItem[] | null = null;
  fileId: string | null = null;
  /** When true, restoreAccount decrypts item.data using iOS IV (toPasswordIOS(password)). */
  fileListIsMultiBackup = false;

  init = async ({
    baseURL,
    backupName,
    appDataFolder,
    scope,
    AES_KEY,
    IV,
    getAuthTokenWrapper,
    getAuthTokenWrapperWithDriveReadonly,
  }: {
    baseURL: string;
    backupName: string;
    appDataFolder: string;
    scope: string;
    AES_KEY: string;
    IV: string;
    getAuthTokenWrapper: (interactive?: boolean) => Promise<string>;
    getAuthTokenWrapperWithDriveReadonly?: (interactive?: boolean) => Promise<string>;
  }) => {
    this.baseURL = baseURL;
    this.backupName = backupName;
    this.appDataFolder = appDataFolder;
    this.scope = scope;
    this.AES_KEY = AES_KEY;
    this.IV = aesjs.utils.utf8.toBytes(IV);
    this.getAuthTokenWrapper = getAuthTokenWrapper;
    this.getAuthTokenWrapperWithDriveReadonly = getAuthTokenWrapperWithDriveReadonly;
  };

  hasBackup = async () => {
    const files = await this.listFiles();
    return files;
  };

  hasUserBackup = async (username: string): Promise<boolean> => {
    const accounts = await this.loadBackupAccounts();
    return accounts.includes(username);
  };

  hasGooglePermission = async (): Promise<boolean> => {
    try {
      const token = await this.getAuthTokenWrapper(false);
      return token !== undefined && token !== null;
    } catch (err) {
      consoleError('hasGooglePermission - not authorized', err);
      return false;
    }
  };

  deleteUserBackup = async (username: string) => {
    if (!this.AES_KEY) {
      throw new Error('Delete backup failed, missing AES_KEY');
    }
    if (!this.fileId) {
      throw new Error('Delete backup failed, missing fileId');
    }
    const backups: DriveItem[] = await this.loadBackup();
    const newBackups = backups.filter((item) => item.username !== username);
    const updateContent = this.encrypt(JSON.stringify(newBackups), this.AES_KEY);
    if (!this.fileId) {
      throw new Error('Delete backup failed, missing fileId');
    }
    return await this.updateFile(this.fileId, updateContent, true);
  };

  encodeToDriveItem = (
    mnemonic: string,
    username: string,
    uid: string,
    password: string
  ): DriveItem => {
    return {
      username: username,
      version: this.version,
      data: this.encrypt(mnemonic, password),
      uid: uid,
      time: new Date().getTime().toString(),
    };
  };

  parseGoogleText = (encryptedData: string) => {
    // Match iOS: trim whitespace and surrounding double quotes (iOS "Compatible extension problem")
    const trimmed = encryptedData.trim().replace(/^"+|"+$/g, '');
    let encryptedHex: string;

    try {
      const sanitizedData = trimmed.replace(/\s+/g, '');
      const parsedData = JSON.parse(sanitizedData);
      encryptedHex = parsedData?.hex || parsedData;
    } catch {
      const rawHex = trimmed.replace(/\s+/g, '');
      if (/^[0-9a-fA-F]+$/.test(rawHex)) {
        encryptedHex = rawHex;
      } else {
        throw new Error('Invalid input: not JSON and not a valid hex string');
      }
    }
    return encryptedHex;
  };

  uploadMnemonicToGoogleDrive = async (
    mnemonic: string,
    username: string,
    uid: string,
    password: string
  ) => {
    if (!this.AES_KEY) {
      throw new Error('Upload backup failed, missing AES_KEY');
    }
    const item = this.encodeToDriveItem(mnemonic, username, uid, password);
    const files = await this.listFiles();
    if (!files) {
      const newContent = this.encrypt(JSON.stringify([item]), this.AES_KEY);
      const file = await this.createFile(newContent);
      return [file];
    }
    const fileId = files.id;
    this.fileId = fileId;
    const text = await this.getFile(fileId);
    const parsedText = this.parseGoogleText(text);
    const decodeContent = await this.decrypt(parsedText, this.AES_KEY);
    const content: DriveItem[] = JSON.parse(decodeContent);
    const result = content.filter((file) => file.username !== username);
    result.unshift(item);
    const updateContent = this.encrypt(JSON.stringify(result), this.AES_KEY);
    return await this.updateFile(fileId, updateContent);
  };

  /**
   * Load backup by file id (use when two files have the same name – legacy vs multi-backup).
   */
  loadBackupByFileId = async (fileId: string): Promise<DriveItem[]> => {
    if (!this.AES_KEY) {
      throw new Error('Load backup failed, missing AES_KEY');
    }
    this.fileListIsMultiBackup = false;
    this.fileId = fileId;
    const text = await this.getFile(fileId);
    const parsedText = this.parseGoogleText(text);
    const decodeContent = await this.decrypt(parsedText, this.AES_KEY);
    const content: DriveItem[] = JSON.parse(decodeContent);
    this.fileList = content;
    return content;
  };

  /**
   * Load backup file in iOS MultiBackup format (encrypted list of StoreItem; IV = first 16 chars of SHA256(key) hex).
   * Sets fileList, fileId, fileListIsMultiBackup=true so restoreAccount uses iOS mnemonic decryption.
   */
  loadBackupMultiBackup = async (
    backupNameOverride?: string,
    backupIdOverride?: string
  ): Promise<DriveItem[]> => {
    if (!this.AES_KEY) {
      throw new Error('Load backup failed, missing AES_KEY');
    }
    const ivIOS = await toPasswordIOS(this.AES_KEY);
    if (backupIdOverride) {
      this.fileId = backupIdOverride;
    } else {
      const name = backupNameOverride ?? this.backupName;
      const files = await this.listFiles(name);
      if (files) {
        this.fileId = files.id;
      } else {
        // No file named outblock_multi_backup: try each file in appDataFolder and use the first that decrypts as multi-backup (StoreItem list).
        const found = await this.tryLoadMultiBackupFromAnyAppDataFile(ivIOS);
        if (found) return found;
        this.fileList = [];
        this.fileListIsMultiBackup = true;
        return [];
      }
    }
    if (!this.fileId) {
      throw new Error('Load backup failed, missing file id');
    }
    const content = await this.fetchAndDecryptMultiBackup(this.fileId, ivIOS);
    this.fileList = content;
    this.fileListIsMultiBackup = true;
    return content;
  };

  /** Try each file in appDataFolder; return first that decrypts as multi-backup (StoreItem list). */
  private tryLoadMultiBackupFromAnyAppDataFile = async (
    ivIOS: Uint8Array
  ): Promise<DriveItem[] | null> => {
    const all = await this.listAppDataFilesForDebug();
    for (const f of all) {
      try {
        const content = await this.fetchAndDecryptMultiBackup(f.id, ivIOS);
        if (content.length > 0) {
          this.fileId = f.id;
          this.fileList = content;
          this.fileListIsMultiBackup = true;
          return content;
        }
      } catch {
        continue;
      }
    }
    return null;
  };

  private fetchAndDecryptMultiBackup = async (
    fileId: string,
    ivIOS: Uint8Array
  ): Promise<DriveItem[]> => {
    if (!this.AES_KEY) {
      throw new Error('Load backup failed, missing AES_KEY');
    }
    const text = await this.getFile(fileId);
    const parsedText = this.parseGoogleText(text);
    const decodeContent = this.decrypt(parsedText, this.AES_KEY, ivIOS);
    const rawList: MultiBackupStoreItem[] = JSON.parse(decodeContent);
    if (!Array.isArray(rawList) || rawList.length === 0) throw new Error('Not multi-backup format');
    if (
      (rawList[0].userName === null || rawList[0].userName === undefined) &&
      (rawList[0] as unknown as { username?: string }).username !== null &&
      (rawList[0] as unknown as { username?: string }).username !== undefined
    ) {
      throw new Error('Legacy backup format');
    }
    return rawList.map((item) => ({
      username: item.userName,
      uid: item.userId ?? null,
      data: item.data,
      version: '1.0',
      time:
        item.updatedTime !== null && item.updatedTime !== undefined
          ? String(item.updatedTime)
          : null,
      code: item.code,
      publicKey: item.publicKey,
      address: item.address,
      keyIndex: item.keyIndex,
      signAlgo: item.signAlgo,
      hashAlgo: item.hashAlgo,
    }));
  };

  /**
   * Decrypt mnemonic encrypted with iOS format (IV = first 16 chars of SHA256(password) hex).
   */
  decryptMnemonicIOS = async (encryptedHex: string, password: string): Promise<string> => {
    const ivIOS = await toPasswordIOS(password);
    return this.decrypt(encryptedHex, password, ivIOS);
  };

  loadBackup = async (
    backupNameOverride?: string,
    backupIdOverride?: string
  ): Promise<DriveItem[]> => {
    this.fileListIsMultiBackup = false;
    if (backupIdOverride) {
      return this.loadBackupByFileId(backupIdOverride);
    }
    if (!this.AES_KEY) {
      throw new Error('Load backup failed, missing AES_KEY');
    }
    const files = await this.listFiles(backupNameOverride);
    if (!files) {
      return [];
    }
    const fileId = files.id;
    this.fileId = fileId;
    const text = await this.getFile(fileId);
    const parsedText = this.parseGoogleText(text);
    const decodeContent = await this.decrypt(parsedText, this.AES_KEY);
    const content: DriveItem[] = JSON.parse(decodeContent);
    this.fileList = content;
    return content;
  };

  loadBackupAccounts = async (
    backupNameOverride?: string,
    backupIdOverride?: string
  ): Promise<string[]> => {
    const fileList = await this.loadBackup(backupNameOverride, backupIdOverride);
    return fileList.map((item) => item.username);
  };

  loadBackupAccountLists = async (
    backupNameOverride?: string,
    backupIdOverride?: string
  ): Promise<DriveItem[]> => {
    const fileList = await this.loadBackup(backupNameOverride, backupIdOverride);
    return fileList.map((file) => {
      if (file['userName']) {
        return {
          ...file,
          username: file['userName'],
        };
      }
      return file;
    });
  };

  /**
   * Load backup account list from a different backup file (by name or id).
   * Sets this.fileList and this.fileId so subsequent restoreAccount() uses this file.
   */
  loadBackupAccountListsWithBackupName = async (
    backupFileName: string,
    backupId?: string
  ): Promise<DriveItem[]> => {
    return this.loadBackupAccountLists(backupFileName, backupId);
  };

  /**
   * Restore mnemonic from Multi Backup using the app key (iOS-compatible).
   * Uses item.code (if present) to derive the password; otherwise uses AES_KEY.
   */
  restoreMultiBackupAccount = async (
    username: string,
    uid: string | null = null,
    passwordOverride?: string
  ): Promise<string | null> => {
    if (!this.AES_KEY) {
      throw new Error('Restore multi-backup failed, missing AES_KEY');
    }
    const files = await this.fileList;
    if (!files || files.length === 0) {
      return null;
    }
    let result: DriveItem | undefined;
    if (uid) {
      result = files.find((file) => file.uid === uid);
    }
    if (!result) {
      result = files.find((file) => file.username === username);
    }
    if (!result) {
      return null;
    }

    const normalizeHex = (v?: string) => (v || '').replace(/^0x/i, '').toLowerCase();
    const expectedPublicKey = normalizeHex(result.publicKey);
    const expectedSignAlgo = result.signAlgo;

    const matchesExpectedKey = async (mnemonic: string): Promise<boolean> => {
      // If the backup item didn't carry key metadata, fall back to "valid mnemonic" only.
      if (!expectedPublicKey || !expectedSignAlgo) return true;

      // Mobile multi-backup uses Flow derivation path with empty passphrase.
      const tuple = await seedWithPathAndPhrase2PublicPrivateKey(mnemonic, FLOW_BIP44_PATH, '');
      const derived =
        expectedSignAlgo === SIGN_ALGO_NUM_ECDSA_P256
          ? tuple.P256.pubK
          : expectedSignAlgo === SIGN_ALGO_NUM_ECDSA_secp256k1
            ? tuple.SECP256K1.pubK
            : '';
      if (!derived) return false;
      return normalizeHex(derived) === expectedPublicKey;
    };

    const tryDecrypt = async (password: string) => {
      const mnemonic = await this.decryptMnemonicIOS(result.data, password);
      if (!bip39.validateMnemonic(mnemonic)) return null;
      // Stronger check: ensure the mnemonic matches the StoreItem key metadata.
      return (await matchesExpectedKey(mnemonic)) ? mnemonic : null;
    };

    const candidates: string[] = [];
    const push = (v?: string) => {
      if (!v) return;
      if (!candidates.includes(v)) candidates.push(v);
    };

    // 1) User-entered password first (backup key or PIN)
    push(passwordOverride);
    if (passwordOverride) {
      // If user entered a raw PIN, iOS derives a 16-char key via toPassword().
      push(await toPasswordString(passwordOverride));
    }

    // 2) App backup key next (common case)
    push(this.AES_KEY);

    // 3) If the item is PIN-protected (iOS "needPin"), try item.code fallbacks.
    if (result.code) {
      push(await toPasswordString(result.code));
      push(result.code);
    }

    for (const candidate of candidates) {
      try {
        const ok = await tryDecrypt(candidate);
        if (ok) return ok;
      } catch {
        continue;
      }
    }

    throw new Error(
      'Failed to decrypt Multi Backup mnemonic. Check backup password/PIN or GD_AES_KEY.'
    );
  };

  restoreAccount = async (
    username: string,
    password: string,
    uid = null
  ): Promise<string | null> => {
    const files = await this.fileList;
    if (files && files.length !== 0) {
      let result: DriveItem | undefined;

      // Check by uid first
      if (uid) {
        result = files.find((file) => file.uid === uid);
      }
      if (!result) {
        result = files.find((file) => file.username === username);
      }
      if (result) {
        if (this.fileListIsMultiBackup) {
          return await this.decryptMnemonicIOS(result.data, password);
        }
        return this.decrypt(result.data, password);
      }
    }
    return null;
  };

  /**
   * List files in appDataFolder (same API as iOS: drive/v3/files, spaces=appDataFolder).
   * iOS: getFileId(fileName) uses spaces "appDataFolder", fields "nextPageToken, files(id, name)", pageSize 10.
   */
  listFiles = async (backupNameOverride?: string): Promise<GoogleDriveFileModel | undefined> => {
    const name = backupNameOverride ?? this.backupName;
    const { files } = (await this.sendRequest('drive/v3/files/', 'GET', {
      spaces: 'appDataFolder',
      fields: 'nextPageToken, files(id, name)',
      pageSize: '10',
    }).then((response) => response.json())) as { files: GoogleDriveFileModel[] };
    const firstMatch = (files ?? []).find((file) => file.name === name);
    return firstMatch;
  };

  /**
   * List file by name in the user's My Drive root. Requires drive.readonly scope (used only for
   * Multi Backup when file was created by mobile). If token is provided, use it; else get one
   * (caller can pass the same token to getFile when loading content).
   */
  listFilesInDriveRoot = async (
    backupNameOverride?: string,
    tokenOverride?: string
  ): Promise<GoogleDriveFileModel | undefined> => {
    if (!this.getAuthTokenWrapperWithDriveReadonly) {
      return undefined;
    }
    const token = tokenOverride ?? (await this.getAuthTokenWrapperWithDriveReadonly(true));
    const name = backupNameOverride ?? this.backupName;
    const q = `'root' in parents and name = '${name}' and trashed = false`;
    const res = await this.sendRequest(
      'drive/v3/files/',
      'GET',
      { q, fields: 'files(id, name, mimeType)' },
      {},
      null,
      token
    );
    const { files } = (await res.json()) as { files: GoogleDriveFileModel[] };
    return (files ?? []).find((file) => file.name === name);
  };

  /**
   * List all files in the appDataFolder (for debug UI – find which folder/file name to use).
   */
  listAppDataFileNames = async (): Promise<string[]> => {
    const items = await this.listAppDataFilesForDebug();
    return items.map((f) => f.name);
  };

  /**
   * List all files in appDataFolder with id and name. Matches iOS getFileId() list params.
   */
  listAppDataFilesForDebug = async (): Promise<{ id: string; name: string }[]> => {
    const { files } = (await this.sendRequest('drive/v3/files/', 'GET', {
      spaces: 'appDataFolder',
      fields: 'nextPageToken, files(id, name)',
      pageSize: '10',
    }).then((response) => response.json())) as { files: GoogleDriveFileModel[] };
    return (files ?? []).map((f) => ({ id: f.id, name: f.name }));
  };

  /**
   * When two files have the same name (e.g. legacy + multi-backup), return the second file's id.
   * Legacy uses the first match; multi-backup can use this to get the other file.
   */
  getSecondFileIdWithSameName = async (backupName?: string): Promise<string | undefined> => {
    const name = backupName ?? this.backupName;
    const all = await this.listAppDataFilesForDebug();
    const sameName = all.filter((f) => f.name === name);
    return sameName.length >= 2 ? sameName[1].id : undefined;
  };

  /**
   * Get file content by id. Same as iOS getFileData(): Drive API files.get with alt=media (raw body).
   */
  getFile = async (fileId: string, tokenOverride?: string) => {
    const result = await this.sendRequest(
      `drive/v3/files/${fileId}`,
      'GET',
      { alt: 'media' },
      {},
      null,
      tokenOverride
    );
    return result.text();
  };

  createFile = async (content: string) => {
    if (content.length === 0) {
      return;
    }

    const file = new Blob([JSON.stringify(content)], { type: 'application/json' });
    const metadata = {
      name: this.backupName, // Filename at Google Drive
      mimeType: 'application/json', // mimeType at Google Drive
      parents: ['appDataFolder'], // Folder ID at Google Drive
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    return await this.sendRequest(
      'upload/drive/v3/files',
      'POST',
      { uploadType: 'multipart', fields: 'id', addParents: 'appDataFolder' },
      {
        metadata: metadata,
        file: content,
      },
      form
    );
  };

  updateFile = async (fileId: string, content: string, isDelete = false) => {
    if (!this.AES_KEY) {
      throw new Error('Update backup failed, missing AES_KEY');
    }
    // Check the content is valid
    const decodeContent = await this.decrypt(content, this.AES_KEY);
    const items: DriveItem[] = JSON.parse(decodeContent);

    // More than one items
    if (items.length > 0) {
      await this.updateFileContent(fileId, content);
    } else {
      // If it is array and it's delete progress
      if (isDelete) {
        await this.updateFileContent(fileId, content);
      }
    }
  };

  private updateFileContent = async (fileId: string, content: string) => {
    const file = new Blob([JSON.stringify(content)], { type: 'application/json' });
    const metadata = {
      name: this.backupName, // Filename at Google Drive
      mimeType: 'application/json', // mimeType at Google Drive
      addParents: ['appDataFolder'], // Folder ID at Google Drive
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    return await this.sendRequest(
      `upload/drive/v3/files/${fileId}`,
      'PATCH',
      { uploadType: 'multipart', fields: 'id', addParents: 'appDataFolder' },
      {
        metadata: metadata,
        file: content,
      },
      form
    );
  };

  deleteFile = async (fileId: string) => {
    return await this.sendRequest(`drive/v3/files/${fileId}`, 'DELETE');
  };

  deleteAllFile = async () => {
    const files = await this.listFiles();
    if (!files) {
      return;
    }
    return this.deleteFile(files.id);
  };

  sendRequest = async (
    url: string,
    method = 'GET',
    params: Record<string, string> = {},
    data = {},
    form: FormData | null = null,
    tokenOverride?: string
  ) => {
    const token = tokenOverride ?? (await this.getAuthTokenWrapper());
    const init = {
      method,
      async: true,
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: '*/*',
      },
      contentType: 'application/json',
    };

    if (method.toUpperCase() !== 'GET') {
      init['body'] = JSON.stringify(data);
    }

    // If we have form, we use form instead of json
    if (form) {
      init['body'] = form;
    }

    const requestURL = this.baseURL + url + '?' + new URLSearchParams(params).toString();
    return await fetch(requestURL, init);
  };

  pad_array = (arr, len = 16, fill = 0) => {
    return new Uint8Array([...arr, ...Array(16).fill(fill)]).slice(0, len);
  };

  encrypt = (text: string, password: string, iv = this.IV): string => {
    // The initialization key (must be 16 bytes)
    const key = this.pad_array(aesjs.utils.utf8.toBytes(password));
    // Convert text to bytes (text must be a multiple of 16 bytes)
    const textBytes = aesjs.padding.pkcs7.pad(aesjs.utils.utf8.toBytes(text));
    const aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
    const encryptedBytes = aesCbc.encrypt(textBytes);
    const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    // Buffer.from(encryptedBytes).toString('base64')
    return encryptedHex;
  };

  decrypt = (encryptedHex, password: string, iv = this.IV): string => {
    // The initialization key (must be 16 bytes)
    const key = this.pad_array(aesjs.utils.utf8.toBytes(password));
    // When ready to decrypt the hex string, convert it back to bytes
    const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
    // The cipher-block chaining mode of operation maintains internal
    // state, so to decrypt a new instance must be instantiated.
    const aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
    const decryptedBytes = aesjs.padding.pkcs7.strip(aesCbc.decrypt(encryptedBytes));
    // Convert our bytes back into text
    const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    return decryptedText.trim();
  };

  /**
   * Test if a profile backup can be decrypted with the given password
   * @param username - The username of the profile to test
   * @param password - The password to test
   * @returns Promise<boolean> - Whether decryption was successful
   */
  testProfileBackupDecryption = async (username: string, password: string): Promise<boolean> => {
    try {
      const backups = await this.loadBackup();
      const backup = backups.find((b) => b.username === username);

      if (!backup) {
        return false;
      }

      const decryptedMnemonic = this.decrypt(backup.data, password);
      return bip39.validateMnemonic(decryptedMnemonic);
    } catch (err) {
      consoleError('testProfileBackupDecryption - error', err);
      // Silently handle decryption errors
      return false;
    }
  };

  /**
   * Set new password for specific profile backups
   * @param oldPassword - The current password
   * @param newPassword - The new password to set
   * @param profileUsernames - Array of profile usernames to update passwords for
   * @returns Promise<boolean> - Success status
   */
  setNewPassword = async (
    oldPassword: string,
    newPassword: string,
    profileUsernames: string[]
  ): Promise<boolean> => {
    if (!this.AES_KEY) {
      throw new Error('Set new password failed, missing AES_KEY');
    }
    if (!this.fileId) {
      throw new Error('Set new password failed, missing fileId');
    }
    try {
      if (!(await this.hasGooglePermission())) {
        throw new Error('Not authorized to update password on google backups');
      }

      // Load all backups
      const backups: DriveItem[] = await this.loadBackup();

      if (backups.length === 0 || !this.fileId) {
        return false;
      }

      // Create a new array with updated backups
      const updatedBackups = backups.map((item) => {
        // Only update backups for specified usernames
        if (profileUsernames.includes(item.username)) {
          try {
            // Verify the old password and decrypt
            const decryptedMnemonic = this.decrypt(item.data, oldPassword);
            if (!bip39.validateMnemonic(decryptedMnemonic)) {
              throw new Error(`Decrypted mnemonic is invalid for ${item.username}`);
            }

            // Re-encrypt with new password
            return {
              ...item,
              data: this.encrypt(decryptedMnemonic, newPassword),
              time: new Date().getTime().toString(),
            };
          } catch (err) {
            consoleError(`Failed to update password for profile backup: ${item.username}`, err);
            throw new Error(`Failed to update password for profile backup: ${item.username}`);
          }
        }

        // Return unchanged for non-selected backups
        return item;
      });

      // Atomic approach - all succeeded, now update the file
      const updateContent = this.encrypt(JSON.stringify(updatedBackups), this.AES_KEY);
      await this.updateFile(this.fileId, updateContent, false);
      return true;
    } catch (err) {
      consoleError('Failed to update password on selected profile backups:', err);
      throw new Error('Failed to update password on selected profile backups');
    }
  };
}

export default new GoogleDriveService();
