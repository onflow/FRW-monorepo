import {
  type RecipientData,
  SearchableTabLayout,
  RecipientList,
  YStack,
} from '@onflow/frw-ui';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { type Contact } from '@/shared/types';
import { LLHeader } from '@/ui/components/LLHeader';
import { useWallet } from '@/ui/hooks/use-wallet';
import { useContacts } from '@/ui/hooks/useContactHook';
import { useProfiles } from '@/ui/hooks/useProfileHook';

export type RecipientTabType = 'accounts' | 'recent' | 'contacts';

interface TabConfig {
  type: RecipientTabType;
  title: string;
}

const SendToScreenView = () => {
  const navigate = useNavigate();
  const params = useParams();
  const wallet = useWallet();
  const {
    recentContacts,
    addressBookContacts,
    cadenceAccounts,
    evmAccounts,
    childAccountsContacts,
  } = useContacts();
  const { childAccounts, currentWallet, userInfo, evmAddress } = useProfiles();

  // Get token ID from URL params or default to 'flow'
  const tokenId = params.id || 'flow';

  // Component state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<RecipientTabType>('accounts');
  const [recipients, setRecipients] = useState<RecipientData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Tab configuration
  const TABS: TabConfig[] = [
    { type: 'accounts', title: chrome.i18n.getMessage('Accounts') || 'My Accounts' },
    { type: 'recent', title: chrome.i18n.getMessage('Recent') || 'Recent' },
    { type: 'contacts', title: chrome.i18n.getMessage('AddressBook') || 'Address Book' },
  ];

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

  // Convert extension contacts to RecipientData format
  const convertContactToRecipient = useCallback((contact: Contact): RecipientData => {
    try {
      // Handle different contact structures (regular contacts vs EVM contacts)
      const isEvmContact = contact.chain !== undefined || !contact.contact_type;

      // Map contact types to RecipientItem accepted types
      let recipientType: 'account' | 'contact' | 'recent' | 'unknown';
      if (contact.contact_type) {
        const contactTypeString = contact.contact_type.toString();
        if (contactTypeString === 'account' || contactTypeString === '1') {
          recipientType = 'account';
        } else {
          recipientType = 'contact';
        }
      } else if (isEvmContact) {
        // EVM contacts should be treated as accounts
        recipientType = 'account';
      } else {
        recipientType = 'contact';
      }

      // Generate unique ID to avoid collisions between different account types
      const uniqueId = isEvmContact
        ? `evm-${contact.id || contact.address}`
        : contact.id?.toString() || contact.address;

      const recipient = {
        id: uniqueId,
        name: contact.contact_name || contact.name || contact.username || 'Contact',
        address: contact.address,
        type: recipientType,
        balance: recipientType === 'account' ? '0 FLOW' : undefined,
        showBalance: recipientType === 'account',
        avatar: contact.avatar || contact.icon,
      };

      return recipient;
    } catch (error) {
      console.error('Error converting contact:', contact, error);
      // Return a fallback recipient
      return {
        id: contact.address || 'unknown',
        name: contact.contact_name || contact.name || 'Unknown Contact',
        address: contact.address || '',
        type: 'contact',
        balance: undefined,
        showBalance: false,
        avatar: contact.avatar || contact.icon,
      };
    }
  }, []);

  // Convert account data to RecipientData format
  const convertAccountToRecipient = useCallback(
    (account: any, type: string = 'account'): RecipientData => ({
      id: account.address || account.id?.toString(),
      name: account.name || account.contact_name || `Account`,
      address: account.address,
      type: type,
      balance: '0 FLOW', // Could load real balance if needed
      showBalance: true,
      avatar: account.icon || account.avatar,
    }),
    []
  );

  // Check if data is still loading
  const isDataLoading = useMemo(() => {
    // For accounts tab, we need at least some account data
    if (activeTab === 'accounts') {
      return !cadenceAccounts && !evmAccounts && !childAccountsContacts;
    }
    // For other tabs, check if the specific data is available
    if (activeTab === 'recent') {
      return recentContacts === undefined;
    }
    if (activeTab === 'contacts') {
      return addressBookContacts === undefined;
    }
    return false;
  }, [
    activeTab,
    cadenceAccounts,
    evmAccounts,
    childAccountsContacts,
    recentContacts,
    addressBookContacts,
  ]);

  // Load recipients data based on active tab
  const loadRecipientsForTab = useCallback(
    async (tab: RecipientTabType) => {
      // Don't load if data is still loading
      if (isDataLoading) {
        console.log(`Skipping load for ${tab} - data still loading`);
        return;
      }

      setIsLoading(true);
      try {
        let recipientsData: RecipientData[] = [];

        switch (tab) {
          case 'accounts':
            // Add cadence accounts (main wallet accounts)
            if (cadenceAccounts?.length > 0) {
              cadenceAccounts.forEach((account) => {
                recipientsData.push(convertContactToRecipient(account));
              });
            }

            // Add EVM accounts
            if (evmAccounts?.length > 0) {
              evmAccounts.forEach((account) => {
                recipientsData.push(convertContactToRecipient(account));
              });
            }

            // Add child accounts
            if (childAccountsContacts?.length > 0) {
              childAccountsContacts.forEach((account) => {
                recipientsData.push(convertContactToRecipient(account));
              });
            }
            break;

          case 'recent':
            if (recentContacts) {
              recipientsData = recentContacts.map(convertContactToRecipient);
            }
            break;

          case 'contacts':
            if (addressBookContacts) {
              recipientsData = addressBookContacts.map(convertContactToRecipient);
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
    [
      isDataLoading,
      cadenceAccounts,
      evmAccounts,
      childAccountsContacts,
      recentContacts,
      addressBookContacts,
      convertContactToRecipient,
    ]
  );

  // Handle tab changes
  const handleTabChange = useCallback(
    (title: string) => {
      const tabType = getTypeByTitle(title);
      setActiveTab(tabType);
    },
    [getTypeByTitle]
  );

  // Handle recipient selection
  const handleRecipientPress = useCallback(
    (recipient: RecipientData) => {
      console.log('Selected recipient:', recipient);
      // Navigate to send-tokens page with the recipient address
      navigate(`/dashboard/token/${tokenId}/send-tokens/${recipient.address}`);
    },
    [navigate, tokenId]
  );

  // Handle search
  const handleScanPress = useCallback(async () => {
    console.log('Scan QR code - not implemented yet');
  }, []);

  // Load data when tab changes or when contact data is updated
  useEffect(() => {
    loadRecipientsForTab(activeTab);
  }, [activeTab, loadRecipientsForTab]);

  const getEmptyStateForTab = () => {
    switch (activeTab) {
      case 'accounts':
        return {
          title: 'No Accounts',
          message: 'No accounts available',
        };
      case 'recent':
        return {
          title: 'No Recent',
          message: 'No recent contacts',
        };
      case 'contacts':
        return {
          title: 'No Contacts',
          message: 'No contacts in address book',
        };
      default:
        return {
          message: 'No recipients available',
        };
    }
  };

  const emptyState = getEmptyStateForTab();
  const tabTitles = TABS.map((tab) => tab.title);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
    >
      <LLHeader title={chrome.i18n.getMessage('Send_to')} help={true} />
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 60px)', // Reserve space for header
        }}
      >
        <YStack flex={1} maxHeight="100%">
          <SearchableTabLayout
            title={chrome.i18n.getMessage('Send_to') || 'Send to'}
            searchValue={searchQuery}
            searchPlaceholder={
              chrome.i18n.getMessage('Search__PlaceHolder') || 'Search address or username'
            }
            showScanButton={true}
            onSearchChange={setSearchQuery}
            onScanPress={handleScanPress}
            tabSegments={tabTitles}
            activeTab={getTitleByType(activeTab)}
            onTabChange={handleTabChange}
          >
            <YStack flex={1} maxHeight="400px" overflow="hidden">
              <RecipientList
                data={recipients}
                isLoading={isLoading || isDataLoading}
                emptyTitle={emptyState.title}
                emptyMessage={emptyState.message}
                onItemPress={handleRecipientPress}
                onItemEdit={() => {}} // Not implemented yet
                onItemCopy={() => {}} // Not implemented yet
                contentPadding={8}
              />
            </YStack>
          </SearchableTabLayout>
        </YStack>
      </div>
    </div>
  );
};

export default SendToScreenView;
