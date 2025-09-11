import { bridge, navigation } from '@onflow/frw-context';
import { RecentRecipientsService } from '@onflow/frw-services';
import {
  sendSelectors,
  useSendStore,
  useWalletStore,
  walletSelectors,
  useAddressBookStore,
  addressBookQueryKeys,
  tokenQueries,
} from '@onflow/frw-stores';
import type { WalletAccount } from '@onflow/frw-types';
import {
  SearchableTabLayout,
  RecipientList,
  AddressBookList,
  type RecipientData,
  ExtensionHeader,
  BackgroundWrapper,
} from '@onflow/frw-ui';
import { isValidEthereumAddress, isValidFlowAddress } from '@onflow/frw-utils';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type RecipientTabType = 'accounts' | 'recent' | 'contacts';

interface TabConfig {
  type: RecipientTabType;
  title: string;
}

/**
 * Query-integrated version of SendToScreen following the established pattern
 * Uses TanStack Query for data fetching and caching
 */
export function SendToScreen(): React.ReactElement {
  const isExtension = bridge.getPlatform() === 'extension';
  const { t } = useTranslation();

  const TABS: TabConfig[] = [
    { type: 'accounts', title: t('send.myAccounts') },
    { type: 'recent', title: t('send.recent') },
    { type: 'contacts', title: t('send.addressBook') },
  ];

  const { setToAccount } = useSendStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<RecipientTabType>('accounts');

  // Get selected token from send store
  const selectedToken = useSendStore(sendSelectors.selectedToken);
  const transactionType = useSendStore((state) => state.transactionType);
  const setCurrentStep = useSendStore((state) => state.setCurrentStep);

  // Update current step when screen loads
  useEffect(() => {
    setCurrentStep('send-to');
  }, [setCurrentStep]);

  const allAccounts = useWalletStore(walletSelectors.getAllAccounts);
  const loadAccountsFromBridge = useWalletStore((state) => state.loadAccountsFromBridge);
  const isLoadingWallet = useWalletStore((state) => state.isLoading);
  const walletError = useWalletStore((state) => state.error);
  const addressBookStore = useAddressBookStore();

  // Initialize wallet accounts on mount (only if not already loaded)
  useEffect(() => {
    if (allAccounts.length === 0 && !isLoadingWallet) {
      loadAccountsFromBridge();
    }
  }, [loadAccountsFromBridge, allAccounts.length, isLoadingWallet]);

  // Query for recent contacts with automatic caching
  const {
    data: recentContacts = [],
    isLoading: isLoadingRecent,
    error: recentError,
  } = useQuery({
    queryKey: addressBookQueryKeys.recent(),
    queryFn: () => addressBookStore.fetchRecent(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for all contacts with automatic caching
  const {
    data: allContacts = [],
    isLoading: isLoadingContacts,
    error: contactsError,
  } = useQuery({
    queryKey: addressBookQueryKeys.contacts(),
    queryFn: () => addressBookStore.fetchContacts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for account balances using batch API
  const { data: batchBalances = [] } = useQuery({
    queryKey: ['batchBalances', allAccounts.map((acc) => acc.address)],
    queryFn: () => tokenQueries.fetchBatchFlowBalances(allAccounts.map((acc) => acc.address)),
    enabled: allAccounts.length > 0,
    staleTime: 30 * 1000, // Cache for 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 60 * 1000, // Refresh every minute
  });

  // Query for NFT counts using NFT collections API
  const { data: nftCounts = {} } = useQuery({
    queryKey: ['nftCounts', allAccounts.map((acc) => acc.address)],
    queryFn: async () => {
      const results: { [address: string]: string } = {};

      const nftCountPromises = allAccounts.map(async (account) => {
        try {
          const nftCollections = await tokenQueries.fetchNFTCollections(account.address);
          const totalCount = nftCollections.reduce(
            (sum, collection) => sum + (collection.count || 0),
            0
          );
          const nftCountDisplay =
            totalCount === 0 ? '0 NFTs' : `${totalCount} NFT${totalCount !== 1 ? 's' : ''}`;

          return {
            address: account.address,
            nftCount: nftCountDisplay,
          };
        } catch (error) {
          console.warn(`Failed to fetch NFT count for ${account.address}:`, error);
          return {
            address: account.address,
            nftCount: '0 NFTs',
          };
        }
      });

      // Wait for all NFT count requests to complete in parallel
      const nftCountResults = await Promise.all(nftCountPromises);
      nftCountResults.forEach(({ address, nftCount }) => {
        results[address] = nftCount;
      });

      return results;
    },
    enabled: allAccounts.length > 0,
    staleTime: 30 * 1000, // Cache for 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 60 * 1000, // Refresh every minute
  });

  // Convert batch balances and NFT counts to the expected format
  const accountBalances = useMemo(() => {
    const results: { [address: string]: { balance: string; nftCount: string } } = {};

    // Create a lookup map from batch results
    const balanceLookup = new Map<string, string>();
    batchBalances.forEach(([address, balance]) => {
      balanceLookup.set(address, balance);
    });

    // Map to expected format with both balance and NFT count
    allAccounts.forEach((account) => {
      const balance = balanceLookup.get(account.address) || '0 FLOW';
      const nftCount = nftCounts[account.address] || '0 NFTs';
      results[account.address] = {
        balance,
        nftCount,
      };
    });

    return results;
  }, [batchBalances, nftCounts, allAccounts]);

  // Convert accounts data
  const accountsData = useMemo((): RecipientData[] => {
    return allAccounts.map((account: WalletAccount) => {
      const balanceInfo = accountBalances[account.address];
      let balance = 'Loading...';

      if (balanceInfo) {
        // Parse NFT count to check if it's 0
        const nftCountMatch = balanceInfo.nftCount.match(/^(\d+)/);
        const nftCount = nftCountMatch ? parseInt(nftCountMatch[1], 10) : 0;

        // Show only FLOW balance if no NFTs, otherwise show both
        balance =
          nftCount > 0 ? `${balanceInfo.balance} | ${balanceInfo.nftCount}` : balanceInfo.balance;
      }

      return {
        id: account.address,
        name: account.name,
        address: account.address,
        avatar: account.avatar,
        emojiInfo: account.emojiInfo,
        parentEmojiInfo: account.parentEmoji || null,
        type: 'account' as const,
        isSelected: false,
        isLinked: !!(account.parentAddress || account.type === 'child'),
        isEVM: account.type === 'evm',
        balance,
        showBalance: true,
      };
    });
  }, [allAccounts, accountBalances]);

  // Convert recent contacts data
  const recentData = useMemo((): RecipientData[] => {
    return recentContacts.map((contact: any) => ({
      id: contact.id,
      name: contact.name,
      address: contact.address,
      avatar: contact.avatar,
      type: 'recent' as const,
      emojiInfo: null,
      parentEmojiInfo: null,
    }));
  }, [recentContacts]);

  // Convert contacts data
  const contactsData = useMemo((): RecipientData[] => {
    return allContacts.map((contact: any) => ({
      id: contact.id,
      name: contact.name,
      address: contact.address,
      avatar: contact.avatar,
      type: 'contact' as const,
      emojiInfo: null,
      parentEmojiInfo: null,
    }));
  }, [allContacts, isLoadingContacts, contactsError]);

  // Get current recipients based on active tab
  const recipients = useMemo(() => {
    switch (activeTab) {
      case 'accounts':
        return accountsData;
      case 'recent':
        return recentData;
      case 'contacts':
        return contactsData;
      default:
        return [];
    }
  }, [activeTab, accountsData, recentData, contactsData]);

  // Get loading state for current tab
  const isLoading = useMemo(() => {
    switch (activeTab) {
      case 'accounts':
        return isLoadingWallet; // Use wallet loading state
      case 'recent':
        return isLoadingRecent;
      case 'contacts':
        return isLoadingContacts;
      default:
        return false;
    }
  }, [activeTab, isLoadingWallet, isLoadingRecent, isLoadingContacts]);

  const getTitleByType = useCallback(
    (type: RecipientTabType): string => {
      return TABS.find((tab) => tab.type === type)?.title || '';
    },
    [TABS]
  );

  const getTypeByTitle = useCallback(
    (title: string): RecipientTabType => {
      return TABS.find((tab) => tab.title === title)?.type || 'accounts';
    },
    [TABS]
  );

  const tabTitles = TABS.map((tab) => tab.title);

  const handleTabChange = useCallback(
    (title: string) => {
      const tabType = getTypeByTitle(title);
      setActiveTab(tabType);
    },
    [getTypeByTitle]
  );

  const handleScanPress = useCallback(async () => {
    // TODO: Implement QR scanning functionality
    console.log('Scan QR code');
  }, []);

  const handleRecipientPress = useCallback(
    async (recipient: RecipientData) => {
      setToAccount({
        id: recipient.id,
        name: recipient.name,
        address: recipient.address,
        avatar: recipient.avatar || '',
        emojiInfo: recipient.emojiInfo,
        isActive: false,
        type: recipient.type === 'account' ? 'main' : undefined,
      });

      // Add to recent recipients (only if not selecting from "My Accounts" tab)
      if (activeTab !== 'accounts') {
        try {
          const recentService = RecentRecipientsService.getInstance();
          await recentService.addRecentRecipient({
            id: recipient.id,
            name: recipient.name,
            address: recipient.address,
            emoji: recipient.emojiInfo?.emoji,
            avatar: recipient.avatar,
          });
        } catch (error) {
          console.warn('Failed to add recent recipient:', error);
          // Don't block navigation if this fails
        }
      }

      // Navigate to appropriate screen based on transaction type
      if (transactionType === 'single-nft') {
        navigation.navigate('SendSingleNFT', { address: recipient.address, recipient });
      } else if (transactionType === 'multiple-nfts') {
        navigation.navigate('SendMultipleNFTs', { address: recipient.address, recipient });
      } else {
        // Default to tokens screen
        navigation.navigate('SendTokens', { address: recipient.address, recipient });
      }
    },
    [setToAccount, activeTab, transactionType]
  );

  // Handle search input changes and auto-navigation for valid addresses
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);

      // Check if the search value is a valid address
      if (value && value.trim()) {
        const trimmedValue = value.trim();

        const isFlowAddress = isValidFlowAddress(trimmedValue);
        const isEvmAddress = isValidEthereumAddress(trimmedValue);

        if (isFlowAddress || isEvmAddress) {
          // Find matching account from the accounts list
          const matchingAccount = allAccounts.find(
            (account) =>
              account.address.toLowerCase() === trimmedValue.toLowerCase() ||
              account.address === trimmedValue
          );

          // Create recipient data
          const recipient: RecipientData = {
            id: trimmedValue,
            name: matchingAccount?.name || 'Unknown Account',
            address: trimmedValue,
            avatar: matchingAccount?.avatar,
            emojiInfo: matchingAccount?.emojiInfo,
            parentEmojiInfo: matchingAccount?.parentEmoji || null,
            type: 'account' as const,
            isSelected: false,
            isLinked: !!(matchingAccount?.parentAddress || matchingAccount?.type === 'child'),
            isEVM: isEvmAddress,
            balance: '',
            showBalance: false,
          };

          // Auto-navigate to the next screen
          handleRecipientPress(recipient);
        }
      }
    },
    [allAccounts, handleRecipientPress]
  );

  const handleRecipientEdit = useCallback((recipient: RecipientData) => {
    // TODO: Handle edit recipient
    console.log('Edit recipient:', recipient);
  }, []);

  const handleRecipientCopy = useCallback((recipient: RecipientData) => {
    // TODO: Handle copy recipient address
    console.log('Copy recipient address:', recipient.address);
  }, []);

  const getEmptyStateForTab = () => {
    switch (activeTab) {
      case 'accounts':
        return {
          title: t('send.noAccounts.title'),
          message: t('send.noAccounts.message'),
        };
      case 'recent':
        return {
          title: t('send.noRecent.title'),
          message: t('send.noRecent.message'),
        };
      case 'contacts':
        return {
          title: t('send.noContacts.title'),
          message: t('send.noContacts.message'),
        };
      default:
        return {
          message: t('send.noRecipients'),
        };
    }
  };

  const emptyState = getEmptyStateForTab();

  return (
    <BackgroundWrapper>
      {isExtension && (
        <ExtensionHeader
          title={t('send.sendTokens.title', 'Sending')}
          help={true}
          onGoBack={() => navigation.goBack()}
          onNavigate={(link: string) => navigation.navigate(link)}
        />
      )}
      <SearchableTabLayout
        title={t('send.sendTo.title')}
        searchValue={searchQuery}
        searchPlaceholder={t('send.searchAddress')}
        showScanButton={true}
        onSearchChange={handleSearchChange}
        onScanPress={handleScanPress}
        tabSegments={tabTitles}
        activeTab={getTitleByType(activeTab)}
        onTabChange={handleTabChange}
        backgroundColor="$bgDrawer"
      >
        {activeTab === 'contacts' ? (
          isLoading ? (
            <RecipientList
              data={[]}
              isLoading={true}
              emptyTitle={emptyState.title}
              emptyMessage={emptyState.message}
              contentPadding={0}
            />
          ) : contactsData.length === 0 ? (
            <RecipientList
              data={[]}
              isLoading={false}
              emptyTitle={emptyState.title}
              emptyMessage={emptyState.message}
              contentPadding={0}
            />
          ) : (
            <AddressBookList
              contacts={contactsData.map((contact) => ({
                ...contact,
                onPress: () => handleRecipientPress(contact),
                onEdit: () => handleRecipientEdit(contact),
                onCopy: () => handleRecipientCopy(contact),
              }))}
              groupByLetter={true}
            />
          )
        ) : (
          <RecipientList
            data={recipients}
            isLoading={isLoading}
            emptyTitle={emptyState.title}
            emptyMessage={emptyState.message}
            onItemPress={handleRecipientPress}
            onItemEdit={handleRecipientEdit}
            onItemCopy={handleRecipientCopy}
            contentPadding={0}
          />
        )}
      </SearchableTabLayout>
    </BackgroundWrapper>
  );
}
