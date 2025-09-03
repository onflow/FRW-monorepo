import { bridge, navigation } from '@onflow/frw-context';
import { sendSelectors, useSendStore } from '@onflow/frw-stores';
import {
  SearchableTabLayout,
  RecipientList,
  type RecipientData,
  Text,
  YStack,
} from '@onflow/frw-ui';
import { logger } from '@onflow/frw-utils';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type RecipientTabType = 'accounts' | 'recent' | 'contacts';

interface TabConfig {
  type: RecipientTabType;
  title: string;
}

interface SendToScreenProps {
  theme?: { isDark: boolean };
  // Optional data loading functions that platforms can provide
  loadAccountsData?: () => Promise<RecipientData[]>;
  loadRecentData?: () => Promise<RecipientData[]>;
  loadContactsData?: () => Promise<RecipientData[]>;
}

export function SendToScreen({
  loadAccountsData,
  loadRecentData,
  loadContactsData,
}: SendToScreenProps) {
  // navigation is imported directly from ServiceContext
  const { t } = useTranslation();
  const TABS: TabConfig[] = [
    { type: 'accounts', title: t('send.myAccounts') },
    { type: 'recent', title: t('send.recent') },
    { type: 'contacts', title: t('send.addressBook') },
  ];

  const { setToAccount, setSelectedToken, setTransactionType, setCurrentStep } = useSendStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<RecipientTabType>('accounts');
  const [recipients, setRecipients] = useState<RecipientData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get selected token from send store
  const selectedToken = useSendStore(sendSelectors.selectedToken);

  // Check bridge cache for token data if selectedToken is null
  useEffect(() => {
    const restoreFromCache = async () => {
      if (useSendStore.getState().transactionType === 'tokens') {
        const cacheData = (await bridge.cache().get('sendFlowData')) as any;
        if (cacheData?.selectedToken) {
          try {
            setSelectedToken(cacheData.selectedToken);
            setTransactionType('tokens');
            setCurrentStep('send-to');

            // Clear the cache after restoring to prevent stale data
            bridge.cache().delete('sendFlowData');
          } catch (error) {
            logger.error('SendToScreen - No token data in cache or error accessing cache');
          }
        }
      }
    };

    restoreFromCache();
  }, [setSelectedToken, setTransactionType, setCurrentStep]);

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
    logger.info('Scan QR code');
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
              recipientsData = [];
            }
            break;

          case 'recent':
            if (loadRecentData) {
              recipientsData = await loadRecentData();
            } else {
              // Fallback mock data for recent
              recipientsData = [];
            }
            break;

          case 'contacts':
            if (loadContactsData) {
              recipientsData = await loadContactsData();
            } else {
              // Fallback mock data for contacts
              recipientsData = [];
            }
            break;
        }

        setRecipients(recipientsData);
      } catch (error) {
        logger.error('Failed to load recipients:', error);
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
      setToAccount({
        id: recipient.id,
        name: recipient.name,
        address: recipient.address,
        avatar: recipient.avatar || '',
        emojiInfo: recipient.emojiInfo,
        isActive: false,
        type: recipient.type === 'account' ? 'main' : undefined,
      });
      // Navigate to send tokens screen - platforms should handle this appropriately
      navigation.navigate('SendTokens', { address: recipient.address, recipient });
    },
    [navigation]
  );

  const handleRecipientEdit = useCallback((recipient: RecipientData) => {
    // TODO: Handle edit recipient
    logger.info('Edit recipient:', recipient);
  }, []);

  const handleRecipientCopy = useCallback((recipient: RecipientData) => {
    // TODO: Handle copy recipient address
    logger.info('Copy recipient address:', recipient.address);
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
