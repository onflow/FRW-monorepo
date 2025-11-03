import { logger } from '@onflow/frw-context';

export interface CredentialRecord {
  credentialId: string;
  flowAddress?: string;
  publicKey?: string;
}

const STORAGE_KEY = 'frw.passkeys.records';

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
  }
}

export function listCredentialRecords(): CredentialRecord[] {
  const records = readStorage();
  return Object.values(records);
}
