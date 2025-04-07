import {
  CURRENT_ID_KEY,
  KEYRING_STATE_CURRENT_KEY,
  type KeyringStateV2,
  VaultEntryV2,
} from '@/shared/types/keyring-types';
import {
  type ChildAccountMap,
  type MainAccount,
  type EvmAddress,
  type WalletAccount,
} from '@/shared/types/wallet-types';
import {
  childAccountsKey,
  evmAccountKey,
  mainAccountsKey,
  userInfoCachekey,
  type UserInfoStore,
} from '@/shared/utils/cache-data-keys';
import {
  activeAccountsKey,
  type ActiveAccountsStore,
  userWalletsKey,
  type UserWalletStore,
} from '@/shared/utils/user-data-keys';

import { useCachedData, useUserData } from './use-data';

export const useMainAccounts = (
  network: string | undefined | null,
  publicKey: string | undefined | null
) => {
  return useCachedData<MainAccount[]>(
    network && publicKey ? mainAccountsKey(network, publicKey) : null
  );
};

export const useChildAccounts = (
  network: string | undefined | null,
  mainAccountAddress: string | undefined | null
) => {
  return useCachedData<WalletAccount[]>(
    network && mainAccountAddress ? childAccountsKey(network, mainAccountAddress) : null
  );
};

export const useEvmAccount = (
  network: string | undefined | null,
  mainAccountAddress: string | undefined | null
) => {
  return useCachedData<WalletAccount>(
    network && mainAccountAddress ? evmAccountKey(network, mainAccountAddress) : null
  );
};

export const useUserInfo = (userId: string | null) => {
  return useUserData<UserInfoStore>(userId ? userInfoCachekey(userId) : null);
};

export const useActiveAccounts = (
  network: string | undefined | null,
  publicKey: string | undefined | null
) => {
  return useUserData<ActiveAccountsStore>(
    network && publicKey ? activeAccountsKey(network, publicKey) : null
  );
};

export const useUserWallets = () => {
  return useUserData<UserWalletStore>(userWalletsKey);
};

export const useCurrentId = () => {
  // Use the currenly selected profile id
  return useUserData<string>(CURRENT_ID_KEY);
};
export const useKeyringIds = () => {
  const keyringState = useUserData<KeyringStateV2>(KEYRING_STATE_CURRENT_KEY);
  if (!keyringState) {
    return null;
  }
  return keyringState.vault.map((vaultEntry) => vaultEntry.id);
};
