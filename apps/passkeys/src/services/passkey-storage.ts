import { logger } from '@onflow/frw-context';

export interface CredentialRecord {
  credentialId: string;
  flowAddress?: string;
  publicKey?: string;
}

const STORAGE_KEY = 'frw.passkeys.records';
const ACTIVE_CREDENTIAL_KEY = 'frw.passkeys.active-credential';

export interface ActiveCredentialRecord {
  credentialId: string;
  address?: string;
  updatedAt: number;
}

function readStorage(): Record<string, CredentialRecord> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CredentialRecord>) : {};
  } catch (error) {
    logger.warn('Failed to parse passkey credential storage', error);
    return {};
  }
}

function writeStorage(records: Record<string, CredentialRecord>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    logger.error('Failed to persist passkey credential storage', error);
  }
}

export function saveCredentialRecord(record: CredentialRecord): void {
  if (!record.credentialId) {
    return;
  }

  const records = readStorage();
  records[record.credentialId] = {
    ...(records[record.credentialId] ?? {}),
    ...record,
  };
  writeStorage(records);
}

export function getCredentialRecord(credentialId: string): CredentialRecord | null {
  const records = readStorage();
  return records[credentialId] ?? null;
}

export function removeCredentialRecord(credentialId: string): void {
  const records = readStorage();
  if (records[credentialId]) {
    delete records[credentialId];
    writeStorage(records);
    const active = getActiveCredential();
    if (active?.credentialId === credentialId) {
      clearActiveCredential();
    }
  }
}

export function listCredentialRecords(): CredentialRecord[] {
  const records = readStorage();
  return Object.values(records);
}

export function setActiveCredential(record: { credentialId: string; address?: string }): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const payload: ActiveCredentialRecord = {
      credentialId: record.credentialId,
      address: record.address,
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(ACTIVE_CREDENTIAL_KEY, JSON.stringify(payload));
  } catch (error) {
    logger.warn('Failed to persist active passkey credential', error);
  }
}

export function getActiveCredential(): ActiveCredentialRecord | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ACTIVE_CREDENTIAL_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as ActiveCredentialRecord;
  } catch (error) {
    logger.warn('Failed to read active passkey credential', error);
    return null;
  }
}

export function clearActiveCredential(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(ACTIVE_CREDENTIAL_KEY);
  } catch (error) {
    logger.warn('Failed to clear active passkey credential', error);
  }
}
