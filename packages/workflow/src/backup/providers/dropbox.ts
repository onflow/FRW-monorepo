import { LegacyCrypto } from '../crypto/legacy-crypto';
import {
  BackupVersion,
  BackupError,
  BackupErrorCode,
  CloudProvider,
  KeyWeight,
  type BackupEntry,
  type BackupFile,
  type CloudStorageProvider,
  type LegacyDriveItem,
} from '../types';

export interface DropboxConfig {
  getAuthToken: (interactive?: boolean) => Promise<string>;
  legacyBackupPath: string; // e.g. '/lilico_backup.json'
  backupPath: string; // e.g. '/frw_backup_v2.json'
  legacyAesKey?: string;
  legacyIV?: string;
}

const CONTENT_BASE_URL = 'https://content.dropboxapi.com/2';
const API_BASE_URL = 'https://api.dropboxapi.com/2';
const MAX_RETRIES = 3;

export class DropboxProvider implements CloudStorageProvider {
  readonly provider = CloudProvider.Dropbox;
  private config: DropboxConfig;
  private legacyCrypto: LegacyCrypto;

  constructor(config: DropboxConfig) {
    this.config = config;
    this.legacyCrypto = new LegacyCrypto(config.legacyIV);
  }

  async hasPermission(): Promise<boolean> {
    try {
      await this.config.getAuthToken(false);
      return true;
    } catch {
      return false;
    }
  }

  async authorize(interactive?: boolean): Promise<string> {
    try {
      return await this.config.getAuthToken(interactive);
    } catch (err) {
      throw new BackupError(BackupErrorCode.AuthFailed, 'Dropbox authorization failed', err);
    }
  }

  async loadBackups(): Promise<BackupEntry[]> {
    const token = await this.authorize();

    // Try v2 file first
    const v2Exists = await this.fileExists(token, this.config.backupPath);
    if (v2Exists) {
      const content = await this.downloadFile(token, this.config.backupPath);
      const backupFile: BackupFile = JSON.parse(content);
      return backupFile.entries;
    }

    // Fall back to v1 legacy file
    const v1Exists = await this.fileExists(token, this.config.legacyBackupPath);
    if (v1Exists) {
      return this.loadLegacyBackups(token, this.config.legacyBackupPath);
    }

    return [];
  }

  async saveBackups(entries: BackupEntry[]): Promise<void> {
    const token = await this.authorize();
    const backupFile: BackupFile = {
      formatVersion: 1,
      entries,
    };
    const content = JSON.stringify(backupFile);
    await this.uploadFile(token, this.config.backupPath, content);
  }

  async deleteAll(): Promise<void> {
    const token = await this.authorize();

    const v2Exists = await this.fileExists(token, this.config.backupPath);
    if (v2Exists) {
      await this.deleteFile(token, this.config.backupPath);
    }

    const v1Exists = await this.fileExists(token, this.config.legacyBackupPath);
    if (v1Exists) {
      await this.deleteFile(token, this.config.legacyBackupPath);
    }
  }

  // ─── Legacy V1 Loading ────────────────────────────

  private async loadLegacyBackups(token: string, path: string): Promise<BackupEntry[]> {
    const rawContent = await this.downloadFile(token, path);
    const parsed = this.parseLegacyRaw(rawContent);

    if (!this.config.legacyAesKey) {
      throw new BackupError(
        BackupErrorCode.CorruptData,
        'Legacy AES key required for V1 backup decryption'
      );
    }

    const decrypted = await this.legacyCrypto.decrypt(parsed, this.config.legacyAesKey);
    const items: LegacyDriveItem[] = JSON.parse(decrypted);
    return items.map((item) => this.legacyToBackupEntry(item));
  }

  /** Handle both JSON-wrapped hex and plain hex formats */
  private parseLegacyRaw(raw: string): string {
    const trimmed = raw.trim();
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'string') {
        return parsed;
      }
      if (parsed && typeof parsed.hex === 'string') {
        return parsed.hex;
      }
    } catch {
      // Not JSON — treat as plain hex
    }
    return trimmed;
  }

  private legacyToBackupEntry(item: LegacyDriveItem): BackupEntry {
    return {
      username: item.userName || item.username,
      uid: item.uid,
      data: item.data,
      version: BackupVersion.V1,
      timestamp: item.time ? new Date(item.time).getTime() : Date.now(),
      keyWeight: KeyWeight.Full,
    };
  }

  // ─── Dropbox REST API Helpers ─────────────────────

  private async fileExists(token: string, path: string): Promise<boolean> {
    try {
      await this.apiRequest(token, `${API_BASE_URL}/files/get_metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      });
      return true;
    } catch (err) {
      if (err instanceof BackupError && err.code === BackupErrorCode.NotFound) {
        return false;
      }
      throw err;
    }
  }

  private async downloadFile(token: string, path: string): Promise<string> {
    const res = await this.request(token, `${CONTENT_BASE_URL}/files/download`, {
      method: 'POST',
      headers: {
        'Dropbox-API-Arg': JSON.stringify({ path }),
      },
    });
    return res.text();
  }

  private async uploadFile(token: string, path: string, content: string): Promise<void> {
    await this.request(token, `${CONTENT_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Dropbox-API-Arg': JSON.stringify({ path, mode: 'overwrite', autorename: false }),
        'Content-Type': 'application/octet-stream',
      },
      body: content,
    });
  }

  private async deleteFile(token: string, path: string): Promise<void> {
    await this.apiRequest(token, `${API_BASE_URL}/files/delete_v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    });
  }

  /**
   * Make a request to the Dropbox API, treating 409 "not_found" as NotFound error.
   */
  private async apiRequest(token: string, url: string, init?: RequestInit): Promise<Response> {
    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await fetch(url, {
          ...init,
          headers: {
            Authorization: `Bearer ${token}`,
            ...init?.headers,
          },
        });

        if (res.status === 429) {
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
          continue;
        }

        if (res.status === 409 || res.status === 404) {
          // Check if it's a not_found error
          let isNotFound = false;
          try {
            const body = await res.clone().text();
            isNotFound = body.includes('not_found') || res.status === 404;
          } catch {
            isNotFound = res.status === 404;
          }
          if (isNotFound) {
            throw new BackupError(BackupErrorCode.NotFound, `Dropbox file not found: ${url}`);
          }
        }

        if (!res.ok) {
          throw new BackupError(
            BackupErrorCode.NetworkError,
            `Dropbox API error: ${res.status} ${res.statusText}`
          );
        }

        return res;
      } catch (err) {
        if (err instanceof BackupError) {
          throw err;
        }
        lastError = err;
        if (attempt < MAX_RETRIES - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
        }
      }
    }

    throw new BackupError(
      BackupErrorCode.NetworkError,
      'Dropbox request failed after retries',
      lastError
    );
  }

  private async request(token: string, url: string, init?: RequestInit): Promise<Response> {
    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await fetch(url, {
          ...init,
          headers: {
            Authorization: `Bearer ${token}`,
            ...init?.headers,
          },
        });

        if (res.status === 429) {
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
          continue;
        }

        if (!res.ok) {
          throw new BackupError(
            BackupErrorCode.NetworkError,
            `Dropbox API error: ${res.status} ${res.statusText}`
          );
        }

        return res;
      } catch (err) {
        if (err instanceof BackupError) {
          throw err;
        }
        lastError = err;
        if (attempt < MAX_RETRIES - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
        }
      }
    }

    throw new BackupError(
      BackupErrorCode.NetworkError,
      'Dropbox request failed after retries',
      lastError
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
