import aesjs from 'aes-js';
import * as bip39 from 'bip39';

import { seedWithPathAndPhrase2PublicPrivateKey } from '@/core/utils/modules/publicPrivateKey';
import {
  FLOW_BIP44_PATH,
  SIGN_ALGO_NUM_ECDSA_P256,
  SIGN_ALGO_NUM_ECDSA_secp256k1,
} from '@/shared/constant';
import { consoleWarn, getErrorMessage } from '@/shared/utils';

import type { MultiBackupStoreItem } from './googleDrive';

type DropboxToken = {
  accessToken: string;
  refreshToken?: string;
  /** ms epoch */
  expiresAt?: number;
  scope?: string;
  accountId?: string;
  uid?: string;
};

interface DriveItemLike {
  username: string;
  data: string;
  version: string;
  uid: string | null;
  time: string | null;
  code?: string;
  publicKey?: string;
  address?: string;
  keyIndex?: number;
  signAlgo?: number;
  hashAlgo?: number;
}

const DROPBOX_TOKEN_STORAGE_KEY = 'frw:dropbox:oauthToken';

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256Base64Url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncodeBytes(new Uint8Array(hashBuffer));
}

function randomPkceVerifier(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  // 32 bytes -> 43 chars verifier (meets RFC 7636 43-128 requirement)
  return base64UrlEncodeBytes(bytes);
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

class DropboxService {
  appKey?: string;
  /** Same key used for iOS multi-backup file-level encryption (GD_AES_KEY). */
  backupAESKey?: string;

  token: DropboxToken | null = null;

  /** Multi-backup items mapped into the same shape as Google Drive service expects. */
  fileList: DriveItemLike[] | null = null;

  init = async ({ appKey, backupAESKey }: { appKey: string; backupAESKey: string }) => {
    this.appKey = appKey;
    this.backupAESKey = backupAESKey;
    await this.loadTokenFromStorage();
  };

  isPrepared = () => Boolean(this.token?.accessToken);

  logout = async () => {
    this.token = null;
    this.fileList = null;
    await this.clearTokenFromStorage();
  };

  loginCloud = async (interactive = true) => {
    await this.ensureValidToken(interactive);
    if (!this.token?.accessToken) throw new Error('Dropbox not authorized');
  };

  /**
   * Multi-backup file name is the same as iOS: "outblock_multi_backup"
   * File content is UTF-8 hex string (sometimes wrapped in quotes), AES-CBC encrypted JSON list.
   */
  loadBackupMultiBackup = async (fileName: string): Promise<DriveItemLike[]> => {
    if (!this.backupAESKey) {
      throw new Error('Dropbox multi-backup load failed, missing backupAESKey');
    }
    await this.loginCloud(true);

    // iOS reads from "/" + backupFileName, and also has a fallback "/appDataFolder/<name>".
    // Dropbox doesn't have appDataFolder, but we keep the fallback for parity with iOS.
    const candidates = [`/${fileName}`, `/appDataFolder/${fileName}`];
    let rawText: string | null = null;
    let lastErr: unknown = null;

    for (const path of candidates) {
      try {
        rawText = await this.downloadFileText(path);
        if (rawText) break;
      } catch (e) {
        lastErr = e;
      }
    }

    if (!rawText) {
      if (lastErr) {
        consoleWarn('Dropbox multi-backup download failed', getErrorMessage(lastErr));
      }
      this.fileList = [];
      return [];
    }

    const fixedHexString = rawText.trim().replace(/^"+|"+$/g, '');
    if (!fixedHexString) {
      this.fileList = [];
      return [];
    }

    const ivIOS = await toPasswordIOS(this.backupAESKey);
    const decryptedJson = this.decrypt(fixedHexString, this.backupAESKey, ivIOS);
    const parsed = JSON.parse(decryptedJson) as MultiBackupStoreItem[];

    const mapped: DriveItemLike[] = (parsed ?? []).map((item) => ({
      username: item.userName,
      uid: item.userId ?? null,
      data: item.data,
      version: '1.0',
      time: item.updatedTime ? String(item.updatedTime) : null,
      code: item.code,
      publicKey: item.publicKey,
      address: item.address,
      keyIndex: item.keyIndex,
      signAlgo: item.signAlgo,
      hashAlgo: item.hashAlgo,
    }));

    this.fileList = mapped;
    return mapped;
  };

  /**
   * Restore mnemonic from Dropbox Multi Backup using iOS-compatible item encryption.
   * Uses multiple candidate passwords:
   * - user-entered password (backup key or PIN) + its toPassword() derived value
   * - backupAESKey (GD_AES_KEY)
   * - item.code fallbacks (if present)
   */
  restoreMultiBackupAccount = async (
    username: string,
    uid: string | null = null,
    passwordOverride?: string
  ): Promise<string | null> => {
    if (!this.backupAESKey) {
      throw new Error('Restore Dropbox multi-backup failed, missing backupAESKey');
    }
    const files = await this.fileList;
    if (!files || files.length === 0) {
      return null;
    }
    let result: DriveItemLike | undefined;
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
      push(await toPasswordString(passwordOverride));
    }

    // 2) App backup key next (common case)
    push(this.backupAESKey);

    // 3) If the item is PIN-protected, try item.code fallbacks.
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
      'Failed to decrypt Multi Backup mnemonic from Dropbox. Check backup password/PIN or GD_AES_KEY.'
    );
  };

  // ---- OAuth + Dropbox API ----

  private async ensureValidToken(interactive: boolean): Promise<void> {
    if (this.token?.accessToken && !this.isTokenExpiredOrExpiringSoon()) return;

    // Try refresh first (non-interactive)
    if (this.token?.refreshToken) {
      try {
        await this.refreshToken();
        if (this.token?.accessToken && !this.isTokenExpiredOrExpiringSoon()) return;
      } catch (e) {
        consoleWarn('Dropbox token refresh failed', getErrorMessage(e));
      }
    }

    if (!interactive) return;
    await this.authorizeWithPkce();
  }

  private isTokenExpiredOrExpiringSoon(bufferMs = 60_000): boolean {
    const expiresAt = this.token?.expiresAt;
    if (!expiresAt) return false; // long-lived token
    return Date.now() + bufferMs >= expiresAt;
  }

  private async authorizeWithPkce(): Promise<void> {
    if (!this.appKey) throw new Error('Dropbox init missing appKey');

    // Dropbox does not allow '#' fragments in redirect URIs. Hash routing in our UI uses '#',
    // but the OAuth redirect URI must be the chromiumapp.org callback from chrome.identity.
    const redirectUri = chrome.identity.getRedirectURL('dropbox').split('#')[0];
    const codeVerifier = randomPkceVerifier();
    const codeChallenge = await sha256Base64Url(codeVerifier);

    const authUrl =
      'https://www.dropbox.com/oauth2/authorize?' +
      new URLSearchParams({
        client_id: this.appKey,
        response_type: 'code',
        redirect_uri: redirectUri,
        token_access_type: 'offline',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        // Match iOS scopes: files.content.read/write
        scope: 'files.content.read files.content.write',
      }).toString();

    const responseUrl = await new Promise<string>((resolve, reject) => {
      chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, (redirectedTo) => {
        const err = chrome.runtime.lastError;
        if (err) return reject(new Error(err.message));
        if (!redirectedTo) return reject(new Error('Dropbox OAuth did not return a redirect URL'));
        resolve(redirectedTo);
      });
    });

    const redirected = new URL(responseUrl);
    const error = redirected.searchParams.get('error');
    const code = redirected.searchParams.get('code');
    if (error) throw new Error(`Dropbox OAuth error: ${error}`);
    if (!code) throw new Error('Dropbox OAuth missing code');

    const body = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: this.appKey,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) {
      throw new Error(`Dropbox token exchange failed: ${res.status} ${await res.text()}`);
    }
    const json = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      scope?: string;
      account_id?: string;
      uid?: string;
    };

    this.token = {
      accessToken: json.access_token,
      refreshToken: json.refresh_token ?? this.token?.refreshToken,
      expiresAt: json.expires_in ? Date.now() + json.expires_in * 1000 : undefined,
      scope: json.scope,
      accountId: json.account_id,
      uid: json.uid,
    };

    await this.saveTokenToStorage(this.token);
  }

  private async refreshToken(): Promise<void> {
    if (!this.appKey) throw new Error('Dropbox init missing appKey');
    if (!this.token?.refreshToken) throw new Error('Dropbox missing refreshToken');

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.token.refreshToken,
      client_id: this.appKey,
    });

    const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) {
      throw new Error(`Dropbox refresh failed: ${res.status} ${await res.text()}`);
    }
    const json = (await res.json()) as {
      access_token: string;
      expires_in?: number;
      scope?: string;
      account_id?: string;
      uid?: string;
    };

    this.token = {
      ...this.token,
      accessToken: json.access_token,
      expiresAt: json.expires_in ? Date.now() + json.expires_in * 1000 : this.token.expiresAt,
      scope: json.scope ?? this.token.scope,
      accountId: json.account_id ?? this.token.accountId,
      uid: json.uid ?? this.token.uid,
    };

    await this.saveTokenToStorage(this.token);
  }

  private async downloadFileText(path: string): Promise<string> {
    if (!this.token?.accessToken) throw new Error('Dropbox not authorized');

    const res = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token.accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({ path }),
      },
    });
    if (!res.ok) {
      throw new Error(`Dropbox download failed: ${res.status} ${await res.text()}`);
    }
    return await res.text();
  }

  private async loadTokenFromStorage(): Promise<void> {
    try {
      const stored = await chrome.storage.local.get([DROPBOX_TOKEN_STORAGE_KEY]);
      const token = stored?.[DROPBOX_TOKEN_STORAGE_KEY] as DropboxToken | undefined;
      if (token?.accessToken) this.token = token;
    } catch (e) {
      consoleWarn('Dropbox token storage read failed', getErrorMessage(e));
    }
  }

  private async saveTokenToStorage(token: DropboxToken): Promise<void> {
    try {
      await chrome.storage.local.set({ [DROPBOX_TOKEN_STORAGE_KEY]: token });
    } catch (e) {
      consoleWarn('Dropbox token storage write failed', getErrorMessage(e));
    }
  }

  private async clearTokenFromStorage(): Promise<void> {
    try {
      await chrome.storage.local.remove([DROPBOX_TOKEN_STORAGE_KEY]);
    } catch (e) {
      consoleWarn('Dropbox token storage clear failed', getErrorMessage(e));
    }
  }

  // ---- Crypto helpers (same as googleDrive service) ----

  private pad_array(arr: Uint8Array, len = 16, fill = 0) {
    return new Uint8Array([...arr, ...Array(16).fill(fill)]).slice(0, len);
  }

  private decrypt(encryptedHex: string, password: string, iv: Uint8Array): string {
    const key = this.pad_array(aesjs.utils.utf8.toBytes(password));
    const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
    const aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
    const decryptedBytes = aesjs.padding.pkcs7.strip(aesCbc.decrypt(encryptedBytes));
    const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    return decryptedText.trim();
  }

  private async decryptMnemonicIOS(encryptedHex: string, password: string): Promise<string> {
    const ivIOS = await toPasswordIOS(password);
    return this.decrypt(encryptedHex, password, ivIOS);
  }
}

export default new DropboxService();
