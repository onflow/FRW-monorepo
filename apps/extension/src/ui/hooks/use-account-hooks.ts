import { useMemo } from 'react';

import {
  accountBalanceKey,
  childAccountAllowTypesKey,
  childAccountDescKey,
  mainAccountsKey,
  mainAccountStorageBalanceKey,
  type MainAccountStorageBalanceStore,
  pendingAccountCreationTransactionsKey,
  registerStatusKey,
  userInfoCachekey,
  type UserInfoStore,
  activeAccountsKey,
  type ActiveAccountsStore,
  userWalletsKey,
  type UserWalletStore,
  CURRENT_ID_KEY,
  KEYRING_STATE_CURRENT_KEY,
} from '@/data-model';
import {
  type KeyringState,
  type VaultEntryV2,
  type VaultEntryV3,
  type MainAccount,
  type PendingTransaction,
} from '@/shared/types';
import { getActiveAccountTypeForAddress } from '@/shared/utils';

import { useCachedData, useUserData } from './use-data';

export const useMainAccounts = (
  network: string | undefined | null,
  publicKey: string | undefined | null
) => {
  return useCachedData<MainAccount[]>(
    network && publicKey ? mainAccountsKey(network, publicKey) : null
  );
};

export const useMainAccount = (
  network: string | undefined | null,
  address: string | undefined | null
) => {
  // The user wallet data - which public key is currently active
  const userWallets = useUserWallets();
  // The main accounts for the current public key
  const mainAccounts = useMainAccounts(network, userWallets?.currentPubkey);
  // The main account for the address
  const mainAccount = mainAccounts?.find((account) => account.address === address);
  return mainAccount;
};

export const useAccountBalance = (
  network: string | undefined | null,
  address: string | undefined | null
) => {
  return useCachedData<string>(network && address ? accountBalanceKey(network, address) : null);
};

export const useMainAccountStorageBalance = (
  network: string | undefined | null,
  address: string | undefined | null
) => {
  return useCachedData<MainAccountStorageBalanceStore>(
    network && address ? mainAccountStorageBalanceKey(network, address) : null
  );
};

export const useChildAccountAllowTypes = (
  network: string | undefined | null,
  parentAccountAddress: string | undefined | null,
  childAccountAddress: string | undefined | null
) => {
  return useCachedData<string[]>(
    network && parentAccountAddress && childAccountAddress
      ? childAccountAllowTypesKey(network, parentAccountAddress, childAccountAddress)
      : null
  );
};

export const useUserInfo = (userId: string | undefined | null) => {
  return useCachedData<UserInfoStore>(userId ? userInfoCachekey(userId) : null);
};

export const useActiveAccounts = (
  network: string | undefined | null,
  publicKey: string | undefined | null
) => {
  const mainAccounts = useMainAccounts(network, publicKey);
  const activeAccounts = useUserData<ActiveAccountsStore>(
    network && publicKey ? activeAccountsKey(network, publicKey) : null
  );
  if (!activeAccounts) {
    // Special case of where main accounts is loaded but we don't have active accounts
    // This can happen if the user is in the process of registering or when there are no main accounts
    // In this case we return the main accounts
    if (mainAccounts && mainAccounts.length === 0) {
      // There are no main accounts so we return an empty array
      return {
        parentAddress: null,
        currentAddress: null,
      };
    }
  }
  return activeAccounts;
};

export const useActiveAccountType = (
  network: string | undefined | null,
  publicKey: string | undefined | null
) => {
  const activeAccounts = useActiveAccounts(network, publicKey);

  const activeAccountType = useMemo(
    () =>
      getActiveAccountTypeForAddress(
        activeAccounts?.currentAddress ?? null,
        activeAccounts?.parentAddress ?? null
      ),
    [activeAccounts?.currentAddress, activeAccounts?.parentAddress]
  );
  return activeAccountType;
};

export const useUserWallets = () => {
  return useUserData<UserWalletStore>(userWalletsKey);
};

export const useCurrentId = () => {
  // Use the currenly selected profile id
  return useUserData<string>(CURRENT_ID_KEY);
};
export const useKeyringIds = () => {
  const keyringState = useUserData<KeyringState>(KEYRING_STATE_CURRENT_KEY);
  if (!keyringState) {
    return null;
  }
  return keyringState.vault?.map((vaultEntry: VaultEntryV2 | VaultEntryV3) => vaultEntry.id) ?? [];
};

export const useRegisterStatus = (pubKey: string | undefined | null) => {
  return useCachedData<boolean>(pubKey ? registerStatusKey(pubKey) : null);
};

export const usePayer = () => {
  return useUserData<string>('lilicoPayer');
};

export const usePendingAccountCreationTransactions = (
  network: string | undefined | null,
  pubkey: string | undefined | null
) => {
  return useCachedData<PendingTransaction[]>(
    network && pubkey ? pendingAccountCreationTransactionsKey(network, pubkey) : null
  );
};

export const useChildAccountDescription = (address: string | undefined | null) => {
  return useCachedData<string>(address ? childAccountDescKey(address) : null);
};
