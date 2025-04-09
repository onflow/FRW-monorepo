export type VaultEntryV2 = {
  id: string;
  encryptedData: string;
};
export type KeyringStateV2 = {
  booted: string;
  vault: VaultEntryV2[];
  vaultVersion: number;
};

export const KEYRING_STATE_V2_KEY = 'keyringStateV2';
export const KEYRING_STATE_V1_KEY = 'keyringState';
export const KEYRING_DEEP_VAULT_KEY = 'deepVault';

export const KEYRING_STATE_CURRENT_KEY = KEYRING_STATE_V2_KEY;
export const KEYRING_STATE_VAULT_V1 = 1;
export const KEYRING_STATE_VAULT_V2 = 2;

export const CURRENT_ID_KEY = 'currentId';
