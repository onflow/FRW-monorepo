import { sendSelectors, useSendStore } from '@onflow/frw-stores';
import {
  SearchableTabLayout,
  RecipientList,
  type RecipientData,
  Text,
  YStack,
} from '@onflow/frw-ui';
import React, { useCallback, useEffect, useState } from 'react';

import type { BaseScreenProps } from '../types';

export type RecipientTabType = 'accounts' | 'recent' | 'contacts';

interface TabConfig {
  type: RecipientTabType;
  title: string;
}

interface SendToScreenProps extends BaseScreenProps {
  theme?: { isDark: boolean };
  // Optional data loading functions that platforms can provide
  loadAccountsData?: () => Promise<RecipientData[]>;
  loadRecentData?: () => Promise<RecipientData[]>;
  loadContactsData?: () => Promise<RecipientData[]>;
}

export function SendToScreen({
  navigation,
  bridge,
  t,
  loadAccountsData,
  loadRecentData,
  loadContactsData,
}: SendToScreenProps) {
  const TABS: TabConfig[] = [
    { type: 'accounts', title: t('send.myAccounts') },
    { type: 'recent', title: t('send.recent') },
    { type: 'contacts', title: t('send.addressBook') },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<RecipientTabType>('accounts');
  const [recipients, setRecipients] = useState<RecipientData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get selected token from send store
  const selectedToken = useSendStore(sendSelectors.selectedToken);
  const setCurrentStep = useSendStore((state) => state.setCurrentStep);

  // Update current step when screen loads
  useEffect(() => {
    setCurrentStep('send-to');
  }, [setCurrentStep]);

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
      // TODO: Load recipients for the active tab
      loadRecipientsForTab(tabType);
    },
    [getTypeByTitle]
  );

  const handleScanPress = useCallback(async () => {
    // TODO: Implement QR scanning functionality
    console.log('Scan QR code');
  }, []);

  const loadRecipientsForTab = useCallback(
    async (tab: RecipientTabType) => {
      setIsLoading(true);
      try {
        let recipientsData: RecipientData[] = [];

        // Use platform-provided data loaders if available, otherwise use mock data
        switch (tab) {
          case 'accounts':
            if (loadAccountsData) {
              recipientsData = await loadAccountsData();
            } else {
              // Fallback mock data for accounts
              recipientsData = [
                {
                  id: '1',
                  name: 'Sample Account 1',
                  address: '0x1234567890123456',
                  type: 'account',
                  balance: '100.50 FLOW',
                  showBalance: true,
                },
                {
                  id: '2',
                  name: 'Sample Account 2',
                  address: '0x9876543210987654',
                  type: 'account',
                  balance: '50.25 FLOW',
                  showBalance: true,
                },
              ];
            }
            break;

          case 'recent':
            if (loadRecentData) {
              recipientsData = await loadRecentData();
            } else {
              // Fallback mock data for recent
              recipientsData = [
                {
                  id: '3',
                  name: 'Recent Contact 1',
                  address: '0xabcdef1234567890',
                  type: 'recent',
                  showBalance: false,
                },
              ];
            }
            break;

          case 'contacts':
            if (loadContactsData) {
              recipientsData = await loadContactsData();
            } else {
              // Fallback mock data for contacts
              recipientsData = [
                {
                  id: '4',
                  name: 'Address Book Contact 1',
                  address: '0xfedcba0987654321',
                  type: 'contact',
                  showBalance: false,
                },
              ];
            }
            break;
        }

        setRecipients(recipientsData);
      } catch (error) {
        console.error('Failed to load recipients:', error);
        setRecipients([]);
      } finally {
        setIsLoading(false);
      }
    },
    [loadAccountsData, loadRecentData, loadContactsData]
  );

  // Load initial data
  useEffect(() => {
    loadRecipientsForTab(activeTab);
  }, [activeTab, loadRecipientsForTab]);

  const handleRecipientPress = useCallback(
    (recipient: RecipientData) => {
      console.log('Selected recipient:', recipient);
      // Navigate to send tokens screen - platforms should handle this appropriately
      navigation.navigate('SendTokens', { address: recipient.address, recipient });
    },
    [navigation]
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
