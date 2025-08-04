export type VaultEntryV2 = {
  id: string;
  encryptedData: string;
};

export type KeyringStateV2 = {
  booted: string;
  vault: VaultEntryV2[];
  vaultVersion: 1 | 2;
};

export type VaultEntryV3 = {
  id: string;
  publicKey: string;
  signAlgo: number;
  encryptedData: string;
};

export type KeyringStateV3 = {
  booted: string;
  vault: VaultEntryV3[];
  vaultVersion: 3;
};

export type KeyringState = KeyringStateV2 | KeyringStateV3;
