import aesjs from 'aes-js';

/** First 16 chars of SHA256(password) hex as UTF-8 bytes (matches iOS toPassword()). */
export async function toPasswordIOS(password: string): Promise<Uint8Array> {
  const input = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', input);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const ivString = hashHex.slice(0, 16);
  return new TextEncoder().encode(ivString);
}

/** First 16 chars of SHA256(password) hex as string (matches iOS toPassword()). */
export async function toPasswordString(password: string): Promise<string> {
  const input = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', input);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex.slice(0, 16);
}

export function parseEncryptedHexPayload(payload: string): string {
  const trimmed = stripEdgeDoubleQuotes(payload.trim());

  try {
    const sanitized = trimmed.replace(/\s+/g, '');
    const parsed = JSON.parse(sanitized);
    return parsed?.hex || parsed;
  } catch {
    const rawHex = trimmed.replace(/\s+/g, '');
    if (/^[0-9a-fA-F]+$/.test(rawHex)) {
      return rawHex;
    }
    throw new Error('Invalid input: not JSON and not a valid hex string');
  }
}

function stripEdgeDoubleQuotes(value: string): string {
  let start = 0;
  let end = value.length;

  while (start < end && value.charCodeAt(start) === 34) {
    start += 1;
  }

  while (end > start && value.charCodeAt(end - 1) === 34) {
    end -= 1;
  }

  return value.slice(start, end);
}

function padArray(arr: Uint8Array, len = 16, fill = 0): Uint8Array {
  return new Uint8Array([...arr, ...Array(16).fill(fill)]).slice(0, len);
}

export function decryptAesHexCbc(encryptedHex: string, password: string, iv: Uint8Array): string {
  const key = padArray(aesjs.utils.utf8.toBytes(password));
  const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
  const aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
  const decryptedBytes = aesjs.padding.pkcs7.strip(aesCbc.decrypt(encryptedBytes));
  const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
  return decryptedText.trim();
}
