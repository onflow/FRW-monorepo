import { AddressBookService, RecentRecipientsService } from '@onflow/frw-services';
import { useTokenStore, useWalletStore } from '@onflow/frw-stores';
import { type WalletAccount } from '@onflow/frw-types';
import { useCallback, useEffect, useState } from 'react';

import NativeFRWBridge from '@/bridge/NativeFRWBridge';

import type { ExtendedWalletAccount } from '../types/recipientTypes';

export const useDataLoader = (t: (key: string, options?: any) => string) => {
  // State for dynamic data from bridge and MMKV
  const [addressBookContacts, setAddressBookContacts] = useState<WalletAccount[]>([]);
  const [recentContacts, setRecentContacts] = useState<WalletAccount[]>([]);
  const [walletAccounts, setWalletAccounts] = useState<ExtendedWalletAccount[]>([]);
  const [isAccountsLoading, setIsAccountsLoading] = useState(false);
  const [isRecentLoading, setIsRecentLoading] = useState(false);
  const [isContactsLoading, setIsContactsLoading] = useState(false);
  const [accountsLoadingData, setAccountsLoadingData] = useState<Set<string>>(new Set());
  const [batchBalanceData, setBatchBalanceData] = useState<Map<string, string>>(new Map());

  // Function to get account balance for a specific address (CACHED VERSION)
  const getAccountBalance = useCallback(
    async (address: string, accountType?: string): Promise<string> => {
      try {
        // Use cached version instead of direct API calls
        const network = await NativeFRWBridge.getNetwork();
        const tokenStore = useTokenStore.getState();
        const result = await tokenStore.getAccountBalance(
          address,
          accountType,
          network || 'mainnet'
        );
        return result.balance;
      } catch (error) {
        console.error(`Failed to fetch cached balance for ${address}:`, error);
        return '0 FLOW';
      }
    },
    []
  );

  // Function to fetch batch Flow balances for all wallet accounts
  const fetchBatchFlowBalances = useCallback(async () => {
    try {
      // Get all wallet account addresses
      const addresses = walletAccounts.map(account => account.address);

      if (addresses.length === 0) return;

      console.log('[SendTo] Fetching batch Flow balances for addresses:', addresses);

      const tokenStore = useTokenStore.getState();
      const balanceResults = await tokenStore.fetchBatchFlowBalances(addresses);

      // Convert to Map for easy lookup
      const balanceMap = new Map<string, string>();
      balanceResults.forEach(([address, displayBalance]) => {
        balanceMap.set(address, displayBalance);
      });

      setBatchBalanceData(balanceMap);
      console.log('[SendTo] Successfully fetched batch balances:', balanceResults.length);
    } catch (error) {
      console.error('[SendTo] Failed to fetch batch Flow balances:', error);
    }
  }, [walletAccounts]);

  // Function to get NFT count for a specific address (CACHED VERSION)
  const getAccountNftCount = useCallback(
    async (address: string, accountType?: string): Promise<string> => {
      try {
        // Use cached version instead of direct API calls
        const network = await NativeFRWBridge.getNetwork();
        const tokenStore = useTokenStore.getState();
        const result = await tokenStore.getAccountBalance(
          address,
          accountType,
          network || 'mainnet'
        );
        return result.nftCountDisplay;
      } catch (error) {
        console.error(`Failed to fetch cached NFT count for ${address}:`, error);
        return '0 NFTs';
      }
    },
    []
  );

  // Load contacts data function
  const loadContactsData = useCallback(async () => {
    // Set loading states for all tabs
    setIsAccountsLoading(true);
    setIsRecentLoading(true);
    setIsContactsLoading(true);

    try {
      // Load address book contacts using direct network request
      try {
        console.log('[SendTo] Loading address book contacts from service...');
        const addressBookData = await AddressBookService.getInstance().getAddressBook();

        console.log('[SendTo] Raw address book from service:', addressBookData);
        console.log('[SendTo] Address book contact count:', addressBookData.contacts?.length);

        if (Array.isArray(addressBookData.contacts) && addressBookData.contacts.length > 0) {
          // Convert to WalletAccount format
          const addressBookWalletAccounts: WalletAccount[] = addressBookData.contacts.map(
            (contact: any) => ({
              id: contact.id || contact.address,
              name: contact.name || contact.contactName || t('contact.unknownContact'),
              emoji: contact.emoji || '👤', // Use actual emoji field or default
              address: contact.address,
              isActive: false,
            })
          );

          setAddressBookContacts(addressBookWalletAccounts);
          console.log(
            '[SendTo] Successfully loaded',
            addressBookWalletAccounts.length,
            'address book contacts'
          );
        } else {
          console.log('[SendTo] No address book contacts found');
          setAddressBookContacts([]);
        }
      } catch (addressBookError) {
        console.error('[SendTo] Failed to load address book contacts:', addressBookError);
        setAddressBookContacts([]);
      }
      setIsContactsLoading(false);

      // Load recent contacts using the new service (MMKV + bridge hybrid)
      const recentWalletAccounts =
        await RecentRecipientsService.getInstance().getAllRecentRecipients();
      setRecentContacts(recentWalletAccounts);
      setIsRecentLoading(false);

      // Load wallet accounts using already-initialized walletStore
      let walletAccountsArray: ExtendedWalletAccount[] = [];

      try {
        console.log('[SendTo] Getting wallet accounts from already-initialized walletStore...');
        const walletStore = useWalletStore.getState();

        // Use already-loaded accounts from app-level initialization (no bridge call needed)
        walletAccountsArray = walletStore.accounts;
        console.log('[SendTo] Found', walletAccountsArray.length, 'accounts from walletStore');

        // No loading state needed since WalletAccount doesn't have financial data
        setAccountsLoadingData(new Set());

        if (walletAccountsArray.length === 0) {
          console.warn('[SendTo] No accounts found in walletStore - may still be initializing');
        }
      } catch (error) {
        console.error('[SendTo] Failed to access walletStore:', error);
        walletAccountsArray = [];
        setAccountsLoadingData(new Set());
      }

      setWalletAccounts(walletAccountsArray);
      setIsAccountsLoading(false);

      // Fetch batch balances for wallet accounts after they are loaded
      if (walletAccountsArray.length > 0) {
        const addresses = walletAccountsArray.map(account => account.address);
        console.log('[SendTo] Fetching batch Flow balances for loaded accounts...');

        const tokenStore = useTokenStore.getState();
        const balanceResults = await tokenStore.fetchBatchFlowBalances(addresses);

        // Convert to Map for easy lookup
        const balanceMap = new Map<string, string>();
        balanceResults.forEach(([address, displayBalance]) => {
          balanceMap.set(address, displayBalance);
        });

        setBatchBalanceData(balanceMap);
        console.log('[SendTo] Successfully fetched batch balances:', balanceResults.length);
      }
    } catch (error) {
      console.error('Failed to load contacts data:', error);
      // Clear loading state on error
      setAccountsLoadingData(new Set());
      setIsAccountsLoading(false);
      setIsRecentLoading(false);
      setIsContactsLoading(false);
    }
  }, [t]); // Only depends on t function for creating addressBook contacts

  // Refresh recent contacts only
  const refreshRecentContacts = useCallback(async () => {
    try {
      const recentWalletAccounts =
        await RecentRecipientsService.getInstance().getAllRecentRecipients();
      setRecentContacts(recentWalletAccounts);
    } catch (error) {
      console.error('Failed to refresh recent contacts:', error);
    }
  }, []);

  // Load initial data once - walletStore is already initialized at app level
  useEffect(() => {
    loadContactsData();
  }, []);
  // Execute only once on component mount, no dependencies

  return {
    // State
    addressBookContacts,
    recentContacts,
    walletAccounts,
    isAccountsLoading,
    isRecentLoading,
    isContactsLoading,
    accountsLoadingData,
    batchBalanceData,

    // Functions
    getAccountBalance,
    getAccountNftCount,
    loadContactsData,
    refreshRecentContacts,
    fetchBatchFlowBalances,
  };
};
