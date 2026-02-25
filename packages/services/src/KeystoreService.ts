/**
 * KeystoreService - Restore from Web3 Secret Storage (Ethereum keystore v3) JSON.
 * Supports PBKDF2 and scrypt KDF, AES-128-CTR, and Keccak-256 MAC verification.
 * Used by the extension (and other apps) to unlock keystore JSON for import/restore.
 */

import { logger } from '@onflow/frw-utils';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { scrypt } from 'ethereum-cryptography/scrypt';


/** Web3 Secret Storage v3 crypto block */
interface KeystoreCrypto {
  cipher: string;
  ciphertext: string;
  cipherparams: { iv: string };
  kdf: 'scrypt' | 'pbkdf2';
  kdfparams: ScryptKdfParams | Pbkdf2KdfParams;
  mac: string;
}

interface ScryptKdfParams {
  dklen: number;
  n: number;
  p: number;
  r: number;
  salt: string;
}

interface Pbkdf2KdfParams {
  c: number;
  dklen: number;
  prf: string;
  salt: string;
}

/** Parsed keystore v3 structure */
export interface KeystoreV3 {
  version: number;
  id?: string;
  address?: string;
  crypto: KeystoreCrypto;
  /** FRW extension: type and optional metadata */
  frw?: {
    type: 'mnemonic' | 'privateKey';
    accounts?: string[];
    derivationPaths?: string[];
    createdAt?: number;
    version?: string;
  };
}

/** Result of unlocking a keystore */
export interface KeystoreUnlockResult {
  /** Decrypted secret: private key (hex) or mnemonic (UTF-8) */
  data: string;
  /** If present, keystore was created with FRW and indicates secret type */
  type?: 'mnemonic' | 'privateKey';
  /** If present, associated account addresses (FRW extension) */
  accounts?: string[];
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/, '');
  if (clean.length % 2 !== 0) throw new Error('Invalid hex length');
  const len = clean.length / 2;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/** Constant-time compare for MAC to avoid timing leaks */
function constantTimeCompare(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i]! ^ b[i]!;
  }
  return diff === 0;
}

/**
 * Derive key using PBKDF2 (Web Crypto) or scrypt (ethereum-cryptography).
 */
async function deriveKey(
  password: string,
  kdf: 'scrypt' | 'pbkdf2',
  kdfparams: ScryptKdfParams | Pbkdf2KdfParams
): Promise<Uint8Array> {
  const passwordBytes = new TextEncoder().encode(password);
  const salt = hexToBytes(
    (kdfparams as ScryptKdfParams).salt ?? (kdfparams as Pbkdf2KdfParams).salt
  );
  const dklen = kdfparams.dklen;

  if (kdf === 'scrypt') {
    const params = kdfparams as ScryptKdfParams;
    return scrypt(passwordBytes, salt, params.n, params.p, params.r, dklen);
  }

  if (kdf === 'pbkdf2') {
    const params = kdfparams as Pbkdf2KdfParams;
    if (params.prf !== 'hmac-sha256') {
      throw new Error(`Unsupported PBKDF2 prf: ${params.prf}`);
    }
    const key = await crypto.subtle.importKey('raw', passwordBytes, 'PBKDF2', false, [
      'deriveBits',
    ]);
    const derived = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: params.c,
        hash: 'SHA-256',
      },
      key,
      dklen * 8
    );
    return new Uint8Array(derived);
  }

  throw new Error(`Unsupported kdf: ${kdf}`);
}

/**
 * Decrypt ciphertext with AES-128-CTR using Web Crypto.
 */
async function aes128CtrDecrypt(
  ciphertext: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array
): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key.slice(0, 16),
    { name: 'AES-CTR' },
    false,
    ['decrypt']
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-CTR', counter: iv, length: 128 },
    cryptoKey,
    ciphertext
  );
  return new Uint8Array(decrypted);
}

/**
 * Validate keystore JSON structure (version 3).
 */
export function validateKeystoreStructure(obj: unknown): obj is KeystoreV3 {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  if (o.version !== 3) return false;
  const crypto = o.crypto;
  if (!crypto || typeof crypto !== 'object') return false;
  const c = crypto as Record<string, unknown>;
  if (
    typeof c.cipher !== 'string' ||
    typeof c.ciphertext !== 'string' ||
    !c.cipherparams ||
    typeof c.cipherparams !== 'object' ||
    typeof (c.cipherparams as { iv?: string }).iv !== 'string' ||
    typeof c.kdf !== 'string' ||
    !c.kdfparams ||
    typeof c.kdfparams !== 'object' ||
    typeof c.mac !== 'string'
  ) {
    return false;
  }
  const kdf = c.kdf as string;
  if (kdf !== 'scrypt' && kdf !== 'pbkdf2') return false;
  const kp = c.kdfparams as Record<string, unknown>;
  if (typeof kp.salt !== 'string' || typeof kp.dklen !== 'number') return false;
  if (kdf === 'pbkdf2' && typeof (kp as unknown as Pbkdf2KdfParams).c !== 'number') return false;
  if (kdf === 'scrypt') {
    const sp = kp as unknown as ScryptKdfParams;
    if (typeof sp.n !== 'number' || typeof sp.p !== 'number' || typeof sp.r !== 'number') {
      return false;
    }
  }
  return true;
}

class KeystoreService {
  private static instance: KeystoreService;

  private constructor() {}

  public static getInstance(): KeystoreService {
    if (!KeystoreService.instance) {
      KeystoreService.instance = new KeystoreService();
    }
    return KeystoreService.instance;
  }

  /**
   * Parse and validate keystore JSON string.
   */
  parseKeystore(json: string): KeystoreV3 {
    let obj: unknown;
    try {
      obj = JSON.parse(json);
    } catch (e) {
      logger.warn('KeystoreService: invalid JSON', e);
      throw new Error('Invalid keystore JSON');
    }
    if (!validateKeystoreStructure(obj)) {
      throw new Error('Invalid keystore structure (expected Web3 Secret Storage v3)');
    }
    return obj;
  }

  /**
   * Unlock a keystore with the given password.
   * Returns the decrypted secret (private key hex or mnemonic) and optional FRW metadata.
   */
  async unlockKeystore(
    keystore: KeystoreV3 | string,
    password: string
  ): Promise<KeystoreUnlockResult> {
    const ks = typeof keystore === 'string' ? this.parseKeystore(keystore) : keystore;

    if (ks.crypto.cipher.toLowerCase() !== 'aes-128-ctr') {
      throw new Error(`Unsupported cipher: ${ks.crypto.cipher}`);
    }

    const derivedKey = await deriveKey(
      password,
      ks.crypto.kdf as 'scrypt' | 'pbkdf2',
      ks.crypto.kdfparams
    );

    const ciphertext = hexToBytes(ks.crypto.ciphertext);
    const macStored = hexToBytes(ks.crypto.mac);

    // MAC = KECCAK256(DK[16..31] ++ ciphertext)
    const macBody = new Uint8Array(16 + ciphertext.length);
    macBody.set(derivedKey.slice(16, 32), 0);
    macBody.set(ciphertext, 16);
    const macComputed = keccak256(macBody);
    if (!constantTimeCompare(macComputed, macStored)) {
      throw new Error('Invalid password or corrupted keystore');
    }

    const iv = hexToBytes(ks.crypto.cipherparams.iv);
    const decrypted = await aes128CtrDecrypt(ciphertext, derivedKey, iv);

    // Decrypted payload is typically a 32-byte private key (hex encoded as 64-char string) or UTF-8 mnemonic
    const decryptedStr = new TextDecoder().decode(decrypted);
    const result: KeystoreUnlockResult = {
      data: decryptedStr.trim(),
    };

    if (ks.frw) {
      result.type = ks.frw.type;
      result.accounts = ks.frw.accounts;
    }

    return result;
  }

  /**
   * Restore private key from keystore JSON (convenience for extension).
   * Returns the private key as hex string (with or without 0x prefix per original encoding).
   */
  async restorePrivateKeyFromKeystore(json: string, password: string): Promise<string> {
    const result = await this.unlockKeystore(json, password);
    const data = result.data;
    // If it looks like hex (64 chars, optional 0x), return normalized hex (no 0x for compatibility with existing flow)
    const hexOnly = data.replace(/^0x/, '');
    if (/^[0-9a-fA-F]{64}$/.test(hexOnly)) {
      return hexOnly;
    }
    // Otherwise treat as raw secret (e.g. mnemonic) - caller may use for different flow
    return data;
  }
}

export { KeystoreService };
