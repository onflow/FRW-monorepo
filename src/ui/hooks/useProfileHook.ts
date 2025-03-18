import { useCallback, useEffect, useRef } from 'react';

import type {
  ChildAccount,
  BlockchainResponse,
  WalletResponse,
} from '@/shared/types/network-types';
import { ensureEvmAddressPrefix, withPrefix } from '@/shared/utils/address';
import { retryOperation } from '@/shared/utils/retryOperation';
import { useNetwork } from '@/ui/hooks/useNetworkHook';
import { useProfileStore } from '@/ui/stores/profileStore';
import { useWallet, useWalletLoaded } from '@/ui/utils/WalletContext';

export const useProfiles = () => {
  const profilesRef = useRef({
    initialized: false,
    loading: true,
  });

  const usewallet = useWallet();
  const walletLoaded = useWalletLoaded();
  const { network } = useNetwork();

  // Action selectors
  const setMainAddress = useProfileStore((state) => state.setMainAddress);
  const setEvmAddress = useProfileStore((state) => state.setEvmAddress);
  const setInitial = useProfileStore((state) => state.setInitial);
  const setChildAccount = useProfileStore((state) => state.setChildAccount);
  const setCurrent = useProfileStore((state) => state.setCurrent);
  const setEvmWallet = useProfileStore((state) => state.setEvmWallet);
  const setMainLoading = useProfileStore((state) => state.setMainLoading);
  const setEvmLoading = useProfileStore((state) => state.setEvmLoading);
  const setUserInfo = useProfileStore((state) => state.setUserInfo);
  const setOtherAccounts = useProfileStore((state) => state.setOtherAccounts);
  const setLoggedInAccounts = useProfileStore((state) => state.setLoggedInAccounts);
  const setWalletList = useProfileStore((state) => state.setWalletList);
  const setParentWallet = useProfileStore((state) => state.setParentWallet);
  const clearProfileData = useProfileStore((state) => state.clearProfileData);

  // State selectors
  const initialStart = useProfileStore((state) => state.initialStart);
  const currentWallet = useProfileStore((state) => state.currentWallet);
  const mainAddress = useProfileStore((state) => state.mainAddress);
  const evmAddress = useProfileStore((state) => state.evmAddress);
  const childAccounts = useProfileStore((state) => state.childAccounts);
  const evmWallet = useProfileStore((state) => state.evmWallet);
  const userInfo = useProfileStore((state) => state.userInfo);
  const otherAccounts = useProfileStore((state) => state.otherAccounts);
  const loggedInAccounts = useProfileStore((state) => state.loggedInAccounts);
  const walletList = useProfileStore((state) => state.walletList);
  const parentWallet = useProfileStore((state) => state.parentWallet);
  const currentWalletIndex = useProfileStore((state) => state.currentWalletIndex);
  const evmLoading = useProfileStore((state) => state.evmLoading);
  const mainAddressLoading = useProfileStore((state) => state.mainAddressLoading);

  /**
   * Formats wallet data for UI display
   * @param data Raw wallet data from blockchain
   * @returns Array of formatted wallet objects with UI-friendly properties
   * Used by freshUserWallet to standardize wallet display format
   */
  const formatWallets = useCallback(
    (data) => {
      console.log('formatWallets called with:', data);
      if (!Array.isArray(data)) {
        console.log('Data is not an array, returning empty array');
        return [];
      }

      const filteredData = data.filter((wallet) => {
        return wallet.chain_id === network;
      });
      console.log('Filtered wallets:', filteredData);

      const result = filteredData.map((wallet, index) => ({
        id: index,
        name: wallet.name || 'Wallet',
        address: withPrefix(wallet.blockchain[0].address),
        key: index,
        icon: wallet.icon || '',
        color: wallet.color || '',
      }));
      console.log('Formatted wallets:', result);
      return result;
    },
    [network]
  );

  /**
   * Sets up Ethereum Virtual Machine (EVM) wallet
   * @param mainAddress The main wallet address to associate with EVM wallet
   * @returns EVM wallet data object
   * Called during initial profile setup and wallet creation
   */
  const setupEvmWallet = useCallback(
    async (mainAddress: string) => {
      console.log('Setting up EVM wallet for:', mainAddress);
      try {
        const [evmRes, emoji] = await Promise.all([
          usewallet.queryEvmAddress(mainAddress),
          usewallet.getEmoji(),
        ]);
        console.log('EVM setup responses:', { evmRes, emoji });

        const evmAddress = ensureEvmAddressPrefix(evmRes!);
        console.log('Formatted EVM address:', evmAddress);

        const evmWalletData: BlockchainResponse = {
          name: emoji[9].name,
          icon: emoji[9].emoji,
          address: evmAddress,
          chain_id: '1',
          id: 1,
          coins: [],
          color: emoji[9].bgcolor,
        };
        console.log('Created EVM wallet data:', evmWalletData);

        await Promise.all([setEvmWallet(evmWalletData), setEvmAddress(evmAddress)]);
        setEvmLoading(false);
        console.log('EVM wallet state updated');

        return evmWalletData;
      } catch (error) {
        console.error('Error setting up EVM wallet:', error);
        throw error;
      }
    },
    [usewallet, setEvmWallet, setEvmAddress, setEvmLoading]
  );

  /**
   * Refreshes all user information including wallet data and account details
   * Core function that updates user's wallet state and related information
   * Called by fetchUserWallet during profile updates
   */
  const freshUserInfo = useCallback(async () => {
    console.log('Starting freshUserInfo');
    if (!usewallet || !walletLoaded) return;

    try {
      const parentAddress = await usewallet.getParentAddress();
      console.log('Parent address:', parentAddress);
      if (!parentAddress) return;

      const [currentWallet, isChild, mainAddress] = await Promise.all([
        usewallet.getCurrentWallet(),
        usewallet.getActiveWallet(),
        usewallet.getMainAddress(),
      ]);
      console.log('Current wallet info:', { currentWallet, isChild, mainAddress });

      if (!currentWallet || !mainAddress) return;

      const mainwallet = await usewallet.returnParentWallet();
      setParentWallet(mainwallet!);
      console.log('Parent wallet set:', mainwallet);

      await setCurrent(currentWallet);

      const [keys, pubKTuple] = await Promise.all([usewallet.getAccount(), usewallet.getPubKey()]);
      console.log('Account keys retrieved');

      const walletData = await retryOperation(() => usewallet.getUserInfo(true), 3, 1000);
      console.log('Wallet data retrieved:', walletData);

      const { otherAccounts, wallet, loggedInAccounts } = await usewallet.openapi.freshUserInfo(
        mainAddress,
        keys,
        pubKTuple,
        walletData,
        isChild
      );
      console.log('Fresh user info retrieved:', { otherAccounts, wallet, loggedInAccounts });

      await Promise.all([
        setOtherAccounts(otherAccounts),
        setUserInfo(wallet),
        setLoggedInAccounts(loggedInAccounts),
      ]);
      console.log('User info states updated');
    } catch (error) {
      console.error('Error in freshUserInfo:', error);
    } finally {
      setMainLoading(false);
      console.log('Main loading set to false');
    }
  }, [
    usewallet,
    walletLoaded,
    setLoggedInAccounts,
    setOtherAccounts,
    setUserInfo,
    setCurrent,
    setMainLoading,
    setParentWallet,
  ]);

  /**
   * First function called in profile initialization
   * Fetches and sets up initial profile data including main address and EVM wallet
   */
  const fetchProfileData = useCallback(async () => {
    if (profilesRef.current.loading) {
      return;
    }

    try {
      profilesRef.current.loading = true;
      console.log('Starting fetchProfileData');
      if (!usewallet || !walletLoaded) return;
      try {
        const mainAddress = await usewallet.getMainAddress();
        console.log('Fetched main address:', mainAddress);
        if (mainAddress) {
          console.log('Setting main address');
          setMainAddress(mainAddress);
          console.log('Setting up EVM wallet');
          await setupEvmWallet(mainAddress);
        }
      } catch (err) {
        console.error('fetchProfileData err', err);
      } finally {
        profilesRef.current.loading = false;
      }
    } catch (error) {
      console.error('Error in fetchProfileData:', error);
    }
  }, [usewallet, setMainAddress, setupEvmWallet, walletLoaded]);

  /**
   * Second function called in profile initialization
   * Retrieves and formats all user wallets for the current network
   */
  const freshUserWallet = useCallback(async () => {
    console.log('Starting freshUserWallet');
    if (!usewallet || !walletLoaded) return;
    const wallet = await usewallet.getUserWallets();
    console.log('User wallets:', wallet);
    if (!wallet) {
      throw new Error('No wallet found');
    }
    const fData = wallet.filter((item) => item.address !== null);
    console.log('Filtered wallet data:', fData);

    if (initialStart) {
      console.log('Initial start, updating device info');
      await usewallet.openapi.putDeviceInfo(fData);
      setInitial(false);
    }
    const formattedWallets = formatWallets(fData);
    console.log('Setting wallet list:', formattedWallets);
    setWalletList(formattedWallets);
  }, [usewallet, initialStart, setInitial, formatWallets, setWalletList, walletLoaded]);

  /**
   * Third function called in profile initialization
   * Checks for child accounts and updates wallet information
   */
  const fetchUserWallet = useCallback(async () => {
    console.log('Starting fetchUserWallet');
    if (!usewallet || !walletLoaded) return;
    console.log('Refreshing user info');
    freshUserInfo();
    console.log('Checking child account');
    const childresp: ChildAccount = await usewallet.checkUserChildAccount();
    console.log('Child account response:', childresp);
    setChildAccount(childresp);
    usewallet.setChildWallet(childresp);
  }, [freshUserInfo, usewallet, setChildAccount, walletLoaded]);

  return {
    fetchProfileData,
    freshUserWallet,
    fetchUserWallet,
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
  };
};
