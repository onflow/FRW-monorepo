import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MAINNET_CHAIN_ID, TESTNET_CHAIN_ID } from '@/shared/types/network-types';
import {
  type FlowAddress,
  type WalletAccount,
  type ChildAccountMap,
  type MainAccount,
  getActiveAccountTypeForAddress,
} from '@/shared/types/wallet-types';
import { ensureEvmAddressPrefix, withPrefix } from '@/shared/utils/address';
import { UserWalletStore } from '@/shared/utils/user-data-keys';
import { useNetwork } from '@/ui/hooks/useNetworkHook';
import { debug } from '@/ui/utils';
import { useWallet, useWalletLoaded } from '@/ui/utils/WalletContext';

import {
  useActiveAccounts,
  useChildAccounts,
  useCurrentId,
  useEvmAccount,
  useKeyringIds,
  useMainAccounts,
  useUserInfo,
  useUserWallets,
} from './use-account-hooks';

const INITIAL_WALLET = {
  name: '',
  icon: '',
  address: '',
  chain_id: 'flow',
  id: 1,
  coins: ['flow'],
  color: '',
  chain: MAINNET_CHAIN_ID,
};

const INITIAL_ACCOUNT = {
  name: '',
  icon: '',
  address: '',
  id: 1,
  color: '',
  keyIndex: 0,
  weight: 0,
  publicKey: '',
  signAlgo: 1,
  hashAlgo: 1,
  signAlgoString: 'ECDSA_secp256k1',
  hashAlgoString: 'SHA3_256',
  chain: MAINNET_CHAIN_ID,
};

export const useProfiles = () => {
  const profilesRef = useRef({
    initialized: false,
    loading: false,
  });

  const wallet = useWallet();
  const walletLoaded = useWalletLoaded();
  const { network } = useNetwork();

  // Replace zustand store with useState hooks
  const [initialStart, setInitialStart] = useState(true);
  const [loggedInAccounts, setLoggedInAccounts] = useState<WalletAccount[]>([]);
  const [currentWalletIndex, setCurrentWalletIndex] = useState(0);

  const currentId = useCurrentId();
  const profileIds = useKeyringIds();

  const userInfo = useUserInfo(currentId ?? '');
  // The user wallet data - which public key is currently active
  const userWallets = useUserWallets();
  // The main accounts for the current public key
  const mainAccounts = useMainAccounts(network, userWallets?.currentPubkey);

  const walletList = mainAccounts ?? [];

  // The accounts that have been selected by the user
  const activeAccounts = useActiveAccounts(network, userWallets?.currentPubkey);
  // The child accounts for the currently active main account
  const childAccounts = useChildAccounts(network, activeAccounts?.parentAddress);

  const parentWallet =
    walletList.find((wallet) => wallet.address === activeAccounts?.parentAddress) ?? INITIAL_WALLET;

  // Wallets other than the parent wallet
  const otherAccounts = walletList.filter((wallet) => wallet.id !== parentWallet.id);

  // The EVM address for the currently active main account
  const evmAccount = useEvmAccount(network, activeAccounts?.parentAddress);
  const evmLoading = evmAccount === undefined;
  const evmWallet = evmAccount ?? INITIAL_WALLET;

  const evmAddress = evmAccount?.address ?? '';
  const mainAddress = activeAccounts?.parentAddress ?? '';

  const mainAddressLoading = !mainAccounts || !activeAccounts || !activeAccounts?.parentAddress;

  // The current wallet is the wallet that the user is currently using
  const currentWallet = useMemo(() => {
    const activeAccountType = getActiveAccountTypeForAddress(
      activeAccounts?.currentAddress ?? null,
      activeAccounts?.parentAddress ?? null
    );
    switch (activeAccountType) {
      case 'evm':
        return evmAccount ?? INITIAL_WALLET;
      case 'child':
        return (
          childAccounts?.find((account) => account.address === activeAccounts?.currentAddress) ??
          INITIAL_WALLET
        );
      case 'main':
        return parentWallet ?? INITIAL_WALLET;
      default:
        return INITIAL_WALLET;
    }
  }, [
    activeAccounts?.currentAddress,
    activeAccounts?.parentAddress,
    evmAccount,
    childAccounts,
    parentWallet,
  ]);
  /**
   * Formats wallet data for UI display
   * @param data Raw wallet data from blockchain
   * @returns Array of formatted wallet objects with UI-friendly properties
   * Used by freshUserWallet to standardize wallet display format
   /
  const formatWallets = useCallback((data: WalletAccount[]) => {
    if (!Array.isArray(data)) {
      return [];
    }

    const result = data.map(
      (wallet, index): WalletAccount => ({
        id: wallet.id || index,
        name: wallet.name || 'Wallet',
        address: withPrefix(wallet.address) || '',
        chain: wallet.chain || MAINNET_CHAIN_ID,
        icon: wallet.icon || '',
        color: wallet.color || '',
      })
    );
    return result;
  }, []);

  /**
   * Sets up Ethereum Virtual Machine (EVM) wallet
   * @param mainAddress The main wallet address to associate with EVM wallet
   * @returns EVM wallet data object
   * Called during initial profile setup and wallet creation
    /
  const setupEvmWallet = useCallback(
    async (mainAddress: FlowAddress) => {
      try {
        const [evmRes, emoji] = await Promise.all([
          wallet.queryEvmAddress(mainAddress),
          wallet.getEmoji(),
        ]);

        const evmAddress = evmRes ? ensureEvmAddressPrefix(evmRes) : '';

        const evmWalletData: WalletAccount = {
          name: emoji[9].name,
          icon: emoji[9].emoji,
          address: evmAddress,
          chain: network === 'testnet' ? TESTNET_CHAIN_ID : MAINNET_CHAIN_ID,
          id: 1,
          color: emoji[9].bgcolor,
        };

        setEvmWallet(evmWalletData);
        setEvmAddress(evmAddress ?? '');
      } catch (error) {
        console.error('Error processing EVM address:', error);
      } finally {
        setEvmLoading(false);
      }
    },
    [wallet, network]
  );

  const fetchProfileData = useCallback(async () => {
    if (profilesRef.current.loading || !wallet || !walletLoaded) {
      return;
    }

    try {
      profilesRef.current.loading = true;
      const mainAddress = await wallet.getMainAddress();
      debug('mainAddress ===', mainAddress);
      if (mainAddress) {
        setMainAddress(mainAddress as FlowAddress);
        debug('setupEvmWallet ===');
        await setupEvmWallet(mainAddress as FlowAddress);

        const childAccounts = await wallet.getChildAccounts();
        debug('childAccounts ===', childAccounts);

        setChildAccounts(childAccounts || {});

        const parentAddress = await wallet.getParentAddress();
        debug('parentAddress ===', parentAddress);
        if (parentAddress) {
          const [currentWallet, isChild] = await Promise.all([
            wallet.getCurrentWallet(),
            wallet.getActiveAccountType(),
          ]);
          debug('currentWallet ===', currentWallet);

          if (currentWallet) {
            const mainwallet = await wallet.returnParentWallet();
            console.log('mainwallet ===', mainwallet);
            setParentWallet(mainwallet!);
            setCurrentWallet(currentWallet);

            const keys = await wallet.getAccount();
            const pubKTuple = await wallet.getPubKey();

            const walletData = await wallet.getUserInfo(true);
            debug('walletData ===', walletData);
            const { otherAccounts, wallet, loggedInAccounts } = await wallet.openapi.freshUserInfo(
              parentAddress,
              keys,
              pubKTuple,
              walletData,
              isChild
            );

            const mainAccounts = await wallet.getMainAccounts();
            setOtherAccounts(mainAccounts ? formatWallets(mainAccounts) : []);
            setUserInfo(wallet);
            // Convert LoggedInAccounts to WalletAccounts format and ensure id is number
            setLoggedInAccounts(
              loggedInAccounts.map((account) => ({
                id:
                  typeof account.id === 'string' ? parseInt(account.id, 10) || 0 : account.id || 0,
                name: 'Wallet',
                address: account.address,
                chain: network === 'testnet' ? TESTNET_CHAIN_ID : MAINNET_CHAIN_ID,
                icon: '',
                color: '',
              }))
            );
          }
        }
      }

      const wallets = await wallet.getMainAccounts();
      debug('wallets ===', wallets);

      if (!wallets) {
        throw new Error('No wallets found');
      }

      if (initialStart) {
        await wallet.openapi.putDeviceInfo(wallets);
        debug('usewallet.openapi.putDeviceInfo ===', wallets);

        setInitialStart(false);
      }

      const formattedWallets = formatWallets(wallets);
      debug('formattedWallets ===', formattedWallets);

      setWalletList(formattedWallets);
    } catch (error) {
      debug('Error in fetchProfileData:', error);
    } finally {
      setMainAddressLoading(false);
      profilesRef.current.loading = false;
    }
  }, [wallet, walletLoaded, initialStart, formatWallets, setupEvmWallet, network]);

  const clearProfileData = useCallback(() => {
    setInitialStart(true);
    setCurrentWallet(null);
    setMainAddress(null);
    setEvmAddress(null);
    setChildAccounts(null);
    setEvmWallet(null);
    setUserInfo(null);
    setOtherAccounts([]);
    setLoggedInAccounts([]);
    setWalletList([]);
    setParentWallet(null);
    setCurrentWalletIndex(0);
    setEvmLoading(false);
    setMainAddressLoading(false);
  }, []);
*/
  const clearProfileData = () => {};
  const fetchProfileData = () => {};

  return {
    fetchProfileData,
    clearProfileData,
    initialStart,
    currentWallet,
    mainAddress,
    evmAddress,
    childAccounts,
    evmWallet,
    userInfo,
    otherAccounts,
    loggedInAccounts,
    walletList,
    parentWallet,
    currentWalletIndex,
    evmLoading,
    mainAddressLoading,
    profileIds,
  };
};
