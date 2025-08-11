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
}

export function SendToScreen({ navigation, bridge, t }: SendToScreenProps) {
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

  const loadRecipientsForTab = useCallback(async (tab: RecipientTabType) => {
    setIsLoading(true);
    try {
      // TODO: Implement actual data loading based on tab
      // This is a placeholder implementation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockRecipients: RecipientData[] = [
        {
          id: '1',
          name: `Sample ${tab} 1`,
          address: '0x1234567890123456',
          type: tab === 'accounts' ? 'account' : tab,
          balance: tab === 'accounts' ? '100.50 FLOW' : undefined,
          showBalance: tab === 'accounts',
        },
        {
          id: '2',
          name: `Sample ${tab} 2`,
          address: '0x9876543210987654',
          type: tab === 'accounts' ? 'account' : tab,
          balance: tab === 'accounts' ? '50.25 FLOW' : undefined,
          showBalance: tab === 'accounts',
        },
      ];

      setRecipients(mockRecipients);
    } catch (error) {
      console.error('Failed to load recipients:', error);
      setRecipients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadRecipientsForTab(activeTab);
  }, [activeTab, loadRecipientsForTab]);

  const handleRecipientPress = useCallback(
    (recipient: RecipientData) => {
      // TODO: Handle recipient selection and navigation
      console.log('Selected recipient:', recipient);
      navigation.navigate('SendAmount', { recipient });
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
