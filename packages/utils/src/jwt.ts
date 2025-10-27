import { Buffer } from 'buffer';

/**
 * Utility helpers for working with JSON Web Tokens (JWT).
 *
 * These helpers avoid adding heavy dependencies like `jwt-decode` and work
 * across both browser (extension) and React Native environments.
 */

/**
 * Decode the payload portion of a JWT without verifying its signature.
 * Returns `null` when the token is invalid or cannot be decoded.
 */
export function decodeJwtPayload<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
>(token: string): TPayload | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const segments = token.split('.');
  if (segments.length < 2) {
    return null;
  }

  try {
    const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded =
      base64.length % 4 === 0 ? base64 : `${base64}${'='.repeat(4 - (base64.length % 4))}`;

    const decoded = Buffer.from(padded, 'base64').toString('utf-8');
    return JSON.parse(decoded) as TPayload;
  } catch {
    return null;
  }
}

/**
 * Extract the Firebase UID (or general subject identifier) from a JWT.
 * Returns `undefined` when the payload has no UID-like value.
 */
export function extractUidFromJwt(token: string): string | undefined {
  const payload = decodeJwtPayload<{ uid?: string; user_id?: string; sub?: string }>(token);
  if (!payload) {
    return undefined;
  }

  return payload.uid || payload.user_id || payload.sub || undefined;
}
