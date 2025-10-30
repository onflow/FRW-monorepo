/*
 * Keys and types to access persistant data in the UI from the background storage cache
 * Persistant data is data that is stored between sessions
 */

import {
  type FlowNetwork,
  type Currency,
  type FlowAddress,
  type WalletAddress,
  type EvmCustomTokenInfo,
} from '@/shared/types';

import { getLocalData } from './storage';

// Keyring Keys
export const KEYRING_STATE_V1_KEY = 'keyringState';
export const KEYRING_STATE_V2_KEY = 'keyringStateV2';
export const KEYRING_STATE_V3_KEY = 'keyringStateV3';

export const KEYRING_DEEP_VAULT_KEY = 'deepVault';

export const KEYRING_STATE_CURRENT_KEY = KEYRING_STATE_V3_KEY;

// Current user ID
export const CURRENT_ID_KEY = 'currentId';

// The active user wallet
export const userWalletsKey = 'userWalletsV2';

// Stored in local storage
// key: `userWallets`
export type UserWalletStore = {
  monitor: string;
  emulatorMode: boolean;
  // The currently selected network
  network: FlowNetwork;
  // The public key of the currently active profile
  currentPubkey: string;
  // The uid of the currently active profile
  uid: string;
};

export const getUserWalletsData = async (): Promise<UserWalletStore | undefined> => {
  return await getLocalData<UserWalletStore>(userWalletsKey);
};
// Profile Current Account - the user selected account on a given network
export const activeAccountsKey = (network: string, publicKey: string) =>
  `active-accounts-${network}-${publicKey}`;

export type ActiveAccountsStore = {
  // The main account address (Parent Flow Account)
  // - null if no main account is selected
  parentAddress: FlowAddress | null;
  // The current address that is actively selected
  // - this will be the parent address if the main account is selected, or
  // - a child account address for a child account
  // - or an evm account address for an evm account
  // - or null if no account is selected
  currentAddress: WalletAddress | null;
};

export const getActiveAccountsData = async (network: string, publicKey: string) => {
  const activeAccounts = await getLocalData<ActiveAccountsStore>(
    activeAccountsKey(network, publicKey)
  );
  return activeAccounts;
};

export const getActiveAccountsByUserWallet = async (): Promise<ActiveAccountsStore | undefined> => {
  const userWallet = await getUserWalletsData();
  const activeAccounts = userWallet
    ? await getLocalData<ActiveAccountsStore>(
        activeAccountsKey(userWallet.network, userWallet.currentPubkey)
      )
    : undefined;
  console.log('getActiveAccountsByUserWallet =====>', activeAccounts);
  return activeAccounts;
};

export const preferencesKey = 'preference';

export type PreferencesStore = {
  displayCurrency: Currency;
  hiddenAccounts: string[];
};

export const getPreferencesData = async (): Promise<PreferencesStore | undefined> => {
  return await getLocalData<PreferencesStore>(preferencesKey);
};

export const evmCustomTokenKey = (network: string) => `${network}evmCustomToken`;
export const getEvmCustomTokenData = async (network: string): Promise<EvmCustomTokenInfo[]> => {
  const data = await getLocalData<EvmCustomTokenInfo[]>(evmCustomTokenKey(network));
  return data || [];
};

export const readAndDismissedNewsKey = () => `newsService`;
export type ReadAndDismissedNewsStore = {
  readIds: string[];
  dismissedIds: string[];
};

export const getReadAndDismissedNewsData = async (): Promise<
  ReadAndDismissedNewsStore | undefined
> => {
  return await getLocalData<ReadAndDismissedNewsStore>(readAndDismissedNewsKey());
};

export const permissionKeyV1 = 'permission';
export const permissionKeyV2 = 'permissionV2';
export const permissionKey = permissionKeyV2;
