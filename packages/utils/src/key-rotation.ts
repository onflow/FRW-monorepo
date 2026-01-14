import type { KeyRotationAccountKey } from '@onflow/frw-types';

export const normalizePublicKey = (publicKey: string): string =>
  publicKey.startsWith('0x') ? publicKey.slice(2) : publicKey;

const normalizeAlgorithm = (value?: string | number): string =>
  (value ?? '').toString().trim().toLowerCase();

export const resolveSignAlgo = (accountKey: KeyRotationAccountKey): number | undefined => {
  if (typeof accountKey.signAlgo === 'number') {
    return accountKey.signAlgo;
  }

  const value = normalizeAlgorithm(accountKey.signAlgoString);
  if (!value) {
    return undefined;
  }

  if (value.includes('secp256k1')) {
    return 2;
  }
  if (value.includes('p256')) {
    return 1;
  }
  if (value.includes('bls')) {
    return 3;
  }

  return undefined;
};

export const resolveHashAlgo = (accountKey: KeyRotationAccountKey): number | undefined => {
  if (typeof accountKey.hashAlgo === 'number') {
    return accountKey.hashAlgo;
  }

  const value = normalizeAlgorithm(accountKey.hashAlgoString);
  if (!value) {
    return undefined;
  }

  if (value.includes('sha2_256')) {
    return 1;
  }
  if (value.includes('sha2_384')) {
    return 2;
  }
  if (value.includes('sha3_256')) {
    return 3;
  }
  if (value.includes('sha3_384')) {
    return 4;
  }
  if (value.includes('kmac')) {
    return 5;
  }

  return undefined;
};
