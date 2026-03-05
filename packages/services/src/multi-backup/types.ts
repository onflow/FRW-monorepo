export interface MultiBackupStoreItem {
  address: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  publicKey: string;
  data: string;
  keyIndex: number;
  signAlgo: number;
  hashAlgo: number;
  weight?: number;
  updatedTime?: number;
  deviceInfo?: unknown;
  code?: string;
  backupType?: string;
}

export interface MultiBackupDriveItem {
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

export interface MultiBackupRestoreInput {
  username: string;
  uid?: string | null;
  passwordOverride?: string;
}

export type MnemonicMetadataMatcher = (
  mnemonic: string,
  item: MultiBackupDriveItem
) => Promise<boolean>;

export interface MultiBackupServiceConfig {
  appBackupKey: string;
  mnemonicMetadataMatcher?: MnemonicMetadataMatcher;
}
