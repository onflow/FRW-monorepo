import { p256 } from '@noble/curves/nist.js';
import { sha256 } from '@noble/hashes/sha2';
import { logger } from '@onflow/frw-utils';

type P256Point = InstanceType<typeof p256.ProjectivePoint>;

import { getCredentialRecord, saveCredentialRecord } from './passkey-storage';
import { hexToBytes } from '../utils/flow-encoding';
import {
  base64UrlToHex,
  decodeAttestationObject,
  decodeAuthenticatorData,
} from '../utils/webauthn-decoder';

export interface PasskeyCredential {
  id: string;
  publicKey: ArrayBuffer;
  response: AuthenticatorAttestationResponse;
}

export interface PasskeyAssertion {
  id: string;
  response: AuthenticatorAssertionResponse;
}

export interface KeyInfo {
  type: 'passkey';
  credentialId: string;
  publicKey: string;
  signAlgo: 'ECDSA_P256';
  signAlgoCode: number;
  hashAlgo: 'SHA2_256';
  hashAlgoCode: number;
  keyIndex: number;
  username?: string;
}

export class PasskeyService {
  private static USER_ID_PREFIX = 'frw.uid';
  private static KEY_INFO_STORAGE_KEY = 'frw.passkeys.key-info';

  private static persistKeyInfo(keyInfo: KeyInfo): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const existingRaw = window.localStorage.getItem(this.KEY_INFO_STORAGE_KEY);
      const parsed: Record<string, KeyInfo> = existingRaw ? JSON.parse(existingRaw) : {};
      parsed[keyInfo.credentialId] = keyInfo;
      window.localStorage.setItem(this.KEY_INFO_STORAGE_KEY, JSON.stringify(parsed));
      saveCredentialRecord({ credentialId: keyInfo.credentialId, publicKey: keyInfo.publicKey });
      logger.info('Passkey info persisted', { credentialId: keyInfo.credentialId });
    } catch (error) {
      logger.error('Failed to persist passkey info', error);
    }
  }

  private static loadKeyInfo(credentialId: string): KeyInfo | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const existingRaw = window.localStorage.getItem(this.KEY_INFO_STORAGE_KEY);
      if (!existingRaw) {
        return null;
      }

      const parsed = JSON.parse(existingRaw) as Record<string, KeyInfo>;
      return parsed[credentialId] ?? null;
    } catch (error) {
      logger.warn('Failed to parse stored passkey info', error);
      return null;
    }
  }

  static getStoredKeyInfo(credentialId: string): KeyInfo | null {
    return this.loadKeyInfo(credentialId);
  }

  static listStoredKeyInfo(): KeyInfo[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(this.KEY_INFO_STORAGE_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as Record<string, KeyInfo>;
      return Object.values(parsed);
    } catch (error) {
      logger.warn('Failed to parse stored passkey info', error);
      return [];
    }
  }

  /**
   * Create a new passkey credential
   */
  static async createPasskey(username: string, displayName?: string): Promise<PasskeyCredential> {
    const userId = new TextEncoder().encode(`${this.USER_ID_PREFIX}.${Date.now()}`).slice(0, 64);

    const createOptions: CredentialCreationOptions = {
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: {
          name: window.location.hostname,
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: username,
          displayName: displayName || username,
        },
        pubKeyCredParams: [
          {
            type: 'public-key',
            alg: -7, // ES256 (ECDSA with P-256 curve and SHA-256 hash)
          },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'direct',
      },
    };

    try {
      const credential = await navigator.credentials.create(createOptions);
      if (!credential || credential.type !== 'public-key') {
        throw new Error('Failed to create passkey credential');
      }

      const pkCredential = credential as PublicKeyCredential;
      const response = pkCredential.response as AuthenticatorAttestationResponse;

      return {
        id: pkCredential.id,
        publicKey: response.getPublicKey()!,
        response,
      };
    } catch (error) {
      logger.error('Passkey creation failed', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Passkey creation failed: ${message}`);
    }
  }

  /**
   * Authenticate with existing passkey
   */
  static async authenticate(options?: {
    credentialId?: string;
    challenge?: Uint8Array | ArrayBuffer | string;
    userVerification?: UserVerificationRequirement;
    timeoutMs?: number;
    rpId?: string;
  }): Promise<PasskeyAssertion> {
    const {
      credentialId,
      challenge,
      userVerification = 'required',
      timeoutMs = 60000,
      rpId = typeof window !== 'undefined' ? window.location.hostname : undefined,
    } = options ?? {};

    const resolvedChallenge =
      challenge ??
      (typeof window !== 'undefined' ? crypto.getRandomValues(new Uint8Array(32)) : null);

    if (!resolvedChallenge) {
      throw new Error('Unable to generate WebAuthn challenge');
    }

    const getOptions: CredentialRequestOptions = {
      publicKey: {
        challenge: this.toArrayBuffer(this.normalizeToUint8Array(resolvedChallenge)),
        rpId,
        userVerification,
        timeout: timeoutMs,
      },
    };

    // If credentialId is provided, use it specifically
    if (credentialId) {
      getOptions.publicKey!.allowCredentials = [
        {
          type: 'public-key',
          id: this.base64URLToBuffer(credentialId),
        },
      ];
    }

    try {
      const assertion = await navigator.credentials.get(getOptions);
      if (!assertion || assertion.type !== 'public-key') {
        throw new Error('Failed to get passkey assertion');
      }

      const pkAssertion = assertion as PublicKeyCredential;
      const response = pkAssertion.response as AuthenticatorAssertionResponse;

      return {
        id: pkAssertion.id,
        response,
      };
    } catch (error) {
      logger.error('Passkey authentication failed', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Passkey authentication failed: ${message}`);
    }
  }

  /**
   * Extract key information from passkey credential
   */
  static async getKeyInfoFromCredential(
    credential: PasskeyCredential,
    username?: string
  ): Promise<KeyInfo> {
    const attestationPublicKey = this.extractPublicKeyFromAttestation(
      credential.response?.attestationObject
    );
    const publicKeyHex = attestationPublicKey ?? this.arrayBufferToHex(credential.publicKey);
    const normalizedPublicKey = this.normalizePublicKeyHex(publicKeyHex);

    const keyInfo: KeyInfo = {
      type: 'passkey',
      credentialId: credential.id,
      publicKey: normalizedPublicKey,
      signAlgo: 'ECDSA_P256',
      signAlgoCode: 2,
      hashAlgo: 'SHA2_256',
      hashAlgoCode: 1,
      keyIndex: 0,
      username,
    };

    this.persistKeyInfo(keyInfo);
    return keyInfo;
  }

  /**
   * Extract key information from passkey assertion
   */
  static async getKeyInfoFromAssertion(assertion: PasskeyAssertion): Promise<KeyInfo> {
    const recoveredPublicKey = this.recoverPublicKeyFromAssertion(assertion);

    const stored = this.loadKeyInfo(assertion.id);
    const credentialRecord = getCredentialRecord(assertion.id);

    const storedPublicKey = stored?.publicKey
      ? this.normalizePublicKeyHex(stored.publicKey)
      : credentialRecord?.publicKey
        ? this.normalizePublicKeyHex(credentialRecord.publicKey)
        : '';

    const resolvedPublicKey = recoveredPublicKey ?? storedPublicKey;

    if (!recoveredPublicKey && storedPublicKey) {
      logger.debug('Using stored public key for passkey assertion', {
        credentialId: assertion.id,
      });
    }
    if (recoveredPublicKey && storedPublicKey && recoveredPublicKey !== storedPublicKey) {
      logger.warn('Recovered public key does not match stored credential record', {
        credentialId: assertion.id,
        stored: storedPublicKey,
        recovered: recoveredPublicKey,
      });
    }

    const fallback: KeyInfo = {
      type: 'passkey',
      credentialId: assertion.id,
      publicKey: resolvedPublicKey,
      signAlgo: 'ECDSA_P256',
      signAlgoCode: 2,
      hashAlgo: 'SHA2_256',
      hashAlgoCode: 1,
      keyIndex: 0,
    };

    if (resolvedPublicKey) {
      this.persistKeyInfo(fallback);
      saveCredentialRecord({
        credentialId: assertion.id,
        publicKey: resolvedPublicKey,
      });
    }

    return fallback;
  }

  private static recoverPublicKeyFromAssertion(assertion: PasskeyAssertion): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const response = assertion.response as AuthenticatorAssertionResponse | undefined;
    if (
      !response ||
      !response.signature ||
      !response.authenticatorData ||
      !response.clientDataJSON
    ) {
      return null;
    }

    try {
      const authenticatorData = new Uint8Array(response.authenticatorData);
      const clientDataJSON = new Uint8Array(response.clientDataJSON);
      const signatureDer = new Uint8Array(response.signature);

      if (!signatureDer.length) {
        return null;
      }

      const clientDataHash = sha256(clientDataJSON);
      const signedBytes = this.concatBytes(authenticatorData, clientDataHash);
      const messageHash = sha256(signedBytes);

      const signature = p256.Signature.fromDER(signatureDer).normalizeS();
      const recoveredKeys: string[] = [];

      for (let recovery = 0; recovery < 4; recovery += 1) {
        try {
          const signatureWithRecovery = signature.addRecoveryBit(recovery).toBytes('recovered');
          const publicKeyBytes = p256.recoverPublicKey(signatureWithRecovery, messageHash, {
            prehash: false,
          });
          const publicKeyPoint = p256.ProjectivePoint.fromHex(publicKeyBytes);
          const compressedKey = publicKeyPoint.toRawBytes(true);

          const isValid = p256.verify(signatureDer, messageHash, compressedKey, {
            prehash: false,
            format: 'der',
          });

          if (!isValid) {
            continue;
          }

          const publicKeyHex = this.pointToPublicKeyHex(publicKeyPoint);
          recoveredKeys.push(publicKeyHex);
        } catch (recoveryError) {
          logger.debug('Public key recovery attempt failed', {
            credentialId: assertion.id,
            recoveryIndex: recovery,
            error: recoveryError instanceof Error ? recoveryError.message : recoveryError,
          });
        }
      }

      if (recoveredKeys.length === 0) {
        logger.warn('Unable to recover public key from passkey assertion', {
          credentialId: assertion.id,
        });
        return null;
      }

      if (recoveredKeys.length > 1 && !recoveredKeys.every((key) => key === recoveredKeys[0])) {
        logger.warn('Multiple distinct public keys recovered from passkey assertion', {
          credentialId: assertion.id,
          recoveredKeys,
        });
      }

      return recoveredKeys[0];
    } catch (error) {
      logger.warn('Failed to recover public key from passkey assertion', {
        credentialId: assertion.id,
        error,
      });
      return null;
    }
  }

  /**
   * Check if WebAuthn is supported
   */
  static isSupported(): boolean {
    if (typeof window === 'undefined') {
      logger.debug('WebAuthn check invoked during SSR');
      return false; // Server-side rendering
    }

    const checks = {
      hasWindow: typeof window !== 'undefined',
      hasPublicKeyCredential: typeof window.PublicKeyCredential !== 'undefined',
      hasNavigator: typeof navigator !== 'undefined',
      hasCredentials:
        typeof navigator !== 'undefined' && typeof navigator.credentials !== 'undefined',
      hasCreate:
        typeof navigator !== 'undefined' &&
        typeof navigator.credentials !== 'undefined' &&
        typeof navigator.credentials.create !== 'undefined',
      hasGet:
        typeof navigator !== 'undefined' &&
        typeof navigator.credentials !== 'undefined' &&
        typeof navigator.credentials.get !== 'undefined',
    };

    logger.debug('WebAuthn support checks', checks);
    logger.debug('User Agent', navigator.userAgent);
    logger.debug('Location', window.location.href);

    const isSupported = !!(
      window.PublicKeyCredential &&
      navigator.credentials &&
      navigator.credentials.create &&
      navigator.credentials.get
    );

    logger.debug('WebAuthn isSupported', { isSupported });
    return isSupported;
  }

  /**
   * Check if platform authenticator is available
   */
  static async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (typeof window === 'undefined' || !this.isSupported()) {
      return false;
    }

    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (error) {
      logger.warn('Platform authenticator availability check failed', error);
      return false;
    }
  }

  /**
   * Convert base64url string to ArrayBuffer
   */
  private static base64URLToBuffer(base64url: string): ArrayBuffer {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const binary = atob(padded);
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return buffer;
  }

  private static normalizeToUint8Array(data: Uint8Array | ArrayBuffer | string): Uint8Array {
    if (typeof data === 'string') {
      return hexToBytes(data);
    }
    if (data instanceof Uint8Array) {
      return data;
    }
    return new Uint8Array(data);
  }

  private static toArrayBuffer(data: Uint8Array | ArrayBuffer): ArrayBuffer {
    if (data instanceof ArrayBuffer) {
      return data;
    }
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  }

  /**
   * Convert ArrayBuffer to hex string
   */
  private static arrayBufferToHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return this.bytesToHex(bytes);
  }

  private static concatBytes(...arrays: Uint8Array[]): Uint8Array {
    const totalLength = arrays.reduce((sum, current) => sum + current.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const array of arrays) {
      result.set(array, offset);
      offset += array.length;
    }
    return result;
  }

  private static bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  private static normalizePublicKeyHex(publicKeyHex: string): string {
    if (!publicKeyHex) {
      return '';
    }

    const trimmed = publicKeyHex.startsWith('0x') ? publicKeyHex.slice(2) : publicKeyHex;
    const lower = trimmed.toLowerCase();

    const derMatch = lower.match(/0004([0-9a-f]{128})$/);
    if (derMatch) {
      return derMatch[1];
    }

    try {
      if (lower.length === 130 && lower.startsWith('04')) {
        return lower.slice(2);
      }

      if (lower.length === 132 && lower.startsWith('04')) {
        return lower.slice(2);
      }

      if (lower.length === 128) {
        return lower;
      }

      if (lower.length === 66 || lower.length === 33 * 2) {
        const point = p256.ProjectivePoint.fromHex(`0x${lower}`);
        return this.pointToPublicKeyHex(point);
      }

      if (lower.length === 64) {
        return lower;
      }
    } catch (error) {
      logger.warn('Failed to normalize stored public key', { error, publicKeyHex });
    }

    logger.warn('Encountered public key with unexpected length during normalization', {
      length: lower.length,
    });
    return lower;
  }

  private static pointToPublicKeyHex(point: P256Point): string {
    const uncompressed = point.toRawBytes(false); // 65 bytes, includes 0x04 prefix
    const withoutPrefix = uncompressed.slice(1); // drop prefix to get 64 bytes (x || y)
    return this.bytesToHex(withoutPrefix);
  }

  private static extractPublicKeyFromAttestation(
    attestationObject?: ArrayBuffer | null
  ): string | null {
    if (!attestationObject) return null;
    try {
      const decoded = decodeAttestationObject(attestationObject);
      const authData = decodeAuthenticatorData(decoded.authData);
      const jwk = authData.attestedCredentialData?.credentialPublicKey;
      if (jwk?.x && jwk?.y) {
        const x = base64UrlToHex(jwk.x);
        const y = base64UrlToHex(jwk.y);
        if (x.length === 64 && y.length === 64) {
          return `${x}${y}`.toLowerCase();
        }
      }
    } catch (error) {
      logger.warn('Failed to decode attestation public key', error);
    }
    return null;
  }
}
