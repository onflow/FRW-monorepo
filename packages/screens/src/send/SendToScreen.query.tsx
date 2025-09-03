import { navigation } from '@onflow/frw-context';
import { useWalletStore, walletSelectors, useAddressBookStore, addressBookQueryKeys } from '@onflow/frw-stores';
import type { WalletAccount } from '@onflow/frw-types';
import {
  SearchableTabLayout,
  RecipientList,
  type RecipientData,
  Text,
  YStack,
} from '@onflow/frw-ui';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { sendSelectors, useSendStore } from '@onflow/frw-stores';

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
  const setCurrentStep = useSendStore((state) => state.setCurrentStep);

  // Update current step when screen loads
  useEffect(() => {
    setCurrentStep('send-to');
  }, [setCurrentStep]);

  // Get wallet data
  const accounts = useWalletStore(walletSelectors.getAllAccounts);
  const loadAccountsFromBridge = useWalletStore(state => state.loadAccountsFromBridge);
  const isLoadingWallet = useWalletStore(state => state.isLoading);
  const walletError = useWalletStore(state => state.error);
  const addressBookStore = useAddressBookStore();

  // Initialize wallet accounts on mount (only if not already loaded)
  useEffect(() => {
    if (accounts.length === 0 && !isLoadingWallet) {
      loadAccountsFromBridge();
    }
  }, [loadAccountsFromBridge, accounts.length, isLoadingWallet]);

  // Query for recent contacts with automatic caching
  const {
    data: recentContacts = [],
    isLoading: isLoadingRecent,
  } = useQuery({
    queryKey: addressBookQueryKeys.recent(),
    queryFn: () => addressBookStore.fetchRecent(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for all contacts with automatic caching
  const {
    data: allContacts = [],
    isLoading: isLoadingContacts,
  } = useQuery({
    queryKey: addressBookQueryKeys.contacts(),
    queryFn: () => addressBookStore.fetchContacts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Convert accounts data
  const accountsData = useMemo((): RecipientData[] => {
    return accounts.map((account: WalletAccount) => ({
      id: account.address,
      name: account.name,
      address: account.address,
      avatar: account.avatar,
      emojiInfo: account.emojiInfo,
      parentEmojiInfo: null,
      type: 'account' as const,
      isSelected: account.isActive,
    }));
  }, [accounts]);

  // Convert recent contacts data
  const recentData = useMemo((): RecipientData[] => {
    return recentContacts.map((contact: any) => ({
      id: contact.id,
      name: contact.name,
      address: contact.address,
      avatar: contact.avatar,
      type: 'recent' as const,
      emojiInfo: {
        emoji: '👤',
        name: 'person',
        color: '#6B7280',
      },
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
      emojiInfo: {
        emoji: '📇',
        name: 'contact',
        color: '#3B82F6',
      },
      parentEmojiInfo: null,
    }));
  }, [allContacts]);

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
    (recipient: RecipientData) => {
      setToAccount({
        id: recipient.id,
        name: recipient.name,
        address: recipient.address,
        avatar: recipient.avatar || '',
        emojiInfo: recipient.emojiInfo,
        isActive: false,
        type: recipient.type === 'account' ? 'main' : undefined,
      });
      // Navigate to send tokens screen
      navigation.navigate('SendTokens', { address: recipient.address, recipient });
    },
    [setToAccount]
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
    <SearchableTabLayout
      title={t('send.sendTo.title')}
      searchValue={searchQuery}
      searchPlaceholder={t('send.searchAddress')}
      showScanButton={true}
      onSearchChange={setSearchQuery}
      onScanPress={handleScanPress}
      tabSegments={tabTitles}
      activeTab={getTitleByType(activeTab)}
      onTabChange={handleTabChange}
    >
      {selectedToken && (
        <YStack mb="$3" p="$3" bg="$bg2" rounded="$3">
          <Text fontSize="$3" color="$textSecondary">
            {t('send.selectedToken')}: {selectedToken.symbol}
          </Text>
        </YStack>
      )}

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
    </SearchableTabLayout>
  );
}