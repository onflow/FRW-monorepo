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

export interface GoogleDriveConfig {
  getAuthToken: (interactive?: boolean) => Promise<string>;
  legacyBackupName: string;
  backupName: string;
  legacyAesKey?: string;
  legacyIV?: string;
}

interface GoogleDriveFile {
  id: string;
  name: string;
}

const BASE_URL = 'https://www.googleapis.com/';
const MAX_RETRIES = 3;

export class GoogleDriveProvider implements CloudStorageProvider {
  readonly provider = CloudProvider.GoogleDrive;
  private config: GoogleDriveConfig;
  private legacyCrypto: LegacyCrypto;

  constructor(config: GoogleDriveConfig) {
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
      throw new BackupError(BackupErrorCode.AuthFailed, 'Google Drive authorization failed', err);
    }
  }

  async loadBackups(): Promise<BackupEntry[]> {
    const token = await this.authorize();

    // Try v2 file first
    const v2File = await this.findFile(token, this.config.backupName);
    if (v2File) {
      const content = await this.getFileContent(token, v2File.id);
      const backupFile: BackupFile = JSON.parse(content);
      return backupFile.entries;
    }

    // Fall back to v1 legacy file
    const v1File = await this.findFile(token, this.config.legacyBackupName);
    if (v1File) {
      return this.loadLegacyBackups(token, v1File.id);
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

    const existing = await this.findFile(token, this.config.backupName);
    if (existing) {
      await this.updateFileContent(token, existing.id, content);
    } else {
      await this.createFile(token, this.config.backupName, content);
    }
  }

  async deleteAll(): Promise<void> {
    const token = await this.authorize();

    const v2File = await this.findFile(token, this.config.backupName);
    if (v2File) {
      await this.deleteFile(token, v2File.id);
    }

    const v1File = await this.findFile(token, this.config.legacyBackupName);
    if (v1File) {
      await this.deleteFile(token, v1File.id);
    }
  }

  // ─── Legacy V1 Loading ────────────────────────────

  private async loadLegacyBackups(token: string, fileId: string): Promise<BackupEntry[]> {
    const rawContent = await this.getFileContent(token, fileId);
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

  // ─── Google Drive REST API Helpers ─────────────────

  private async findFile(token: string, name: string): Promise<GoogleDriveFile | null> {
    const query = encodeURIComponent(`name='${name}' and trashed=false`);
    const url = `${BASE_URL}drive/v3/files?q=${query}&spaces=appDataFolder`;
    const res = await this.request(token, url);
    const data = await res.json();
    const files = data.files as GoogleDriveFile[] | undefined;
    return files && files.length > 0 ? files[0] : null;
  }

  private async getFileContent(token: string, fileId: string): Promise<string> {
    const url = `${BASE_URL}drive/v3/files/${fileId}?alt=media`;
    const res = await this.request(token, url);
    return res.text();
  }

  private async createFile(token: string, name: string, content: string): Promise<void> {
    const metadata = {
      name,
      parents: ['appDataFolder'],
    };
    const boundary = '-------314159265358979323846';
    const body =
      `--${boundary}\r\n` +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      '\r\n' +
      `--${boundary}\r\n` +
      'Content-Type: application/json\r\n\r\n' +
      content +
      '\r\n' +
      `--${boundary}--`;

    await this.request(token, `${BASE_URL}upload/drive/v3/files?uploadType=multipart`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });
  }

  private async updateFileContent(token: string, fileId: string, content: string): Promise<void> {
    await this.request(token, `${BASE_URL}upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: content,
    });
  }

  private async deleteFile(token: string, fileId: string): Promise<void> {
    await this.request(token, `${BASE_URL}drive/v3/files/${fileId}`, {
      method: 'DELETE',
    });
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
          // Rate limited — retry with backoff
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
          continue;
        }

        if (!res.ok) {
          throw new BackupError(
            BackupErrorCode.NetworkError,
            `Google Drive API error: ${res.status} ${res.statusText}`
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
      'Google Drive request failed after retries',
      lastError
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
