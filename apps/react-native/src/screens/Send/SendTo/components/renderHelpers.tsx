import { WalletAccount } from '@onflow/frw-types';
import { Alert, Platform, ToastAndroid, View } from 'react-native';
import { Skeleton, Text, WalletAccountSection } from 'ui';
import type { RecipientTabType } from '../SendToScreen';
import type { ExtendedWalletAccount, ListItem } from '../types/recipientTypes';

interface RenderHelpersProps {
  isDark: boolean;
  t: (key: string, options?: any) => string;
  debouncedSearchQuery: string;
  activeTab: RecipientTabType;
  accountsLoadingData: Set<string>;
  batchBalanceData: Map<string, string>;
  addressBookContacts: WalletAccount[];
  dividerStyle: { height: number; backgroundColor: string };
  handleEditPress: () => void;
  handleAccountPress: (account: ExtendedWalletAccount) => void;
  handleUnknownAddressPress: (address: string) => void;
  handleCopyPress: (address: string) => void;
  selectedFromAccount?: WalletAccount | null; // New prop for selected from account
}

/**
 * Render individual list items
 */
export const createRenderItem = ({
  debouncedSearchQuery,
  activeTab,
  batchBalanceData,
  addressBookContacts,
  dividerStyle,
  handleAccountPress,
  handleUnknownAddressPress,
  handleCopyPress,
  selectedFromAccount,
}: RenderHelpersProps) => {
  return ({ item }: { item: ListItem }) => {
    switch (item.type) {
      case 'header': {
        return (
          <Text className="text-fg-2 text-xs mb-3 font-normal" disableAndroidFix={true}>
            {item.title}
          </Text>
        );
      }

      case 'account':
      case 'contact': {
        const isContact = item.type === 'contact';

        // Check if this account exists in Address Book (for avatar prioritization)
        const accountExistsInAddressBook = addressBookContacts.some(
          contact =>
            contact.address.toLowerCase() ===
            (item.data as ExtendedWalletAccount).address.toLowerCase()
        );

        // Determine context for display properties
        let useLetterAvatar = false;
        let showBalanceForAll = false;

        if (debouncedSearchQuery) {
          // In search mode, determine context from the item ID prefix
          const isSearchContact = item.id.startsWith('search-contact-');
          const isSearchAccount = item.id.startsWith('search-account-');
          const isSearchRecent = item.id.startsWith('search-recent-');

          // Use letter avatar for address book contacts OR recent items that exist in address book
          useLetterAvatar = isSearchContact || (isSearchRecent && accountExistsInAddressBook);
          showBalanceForAll = isSearchAccount; // Show balance for My Accounts items in search
        } else {
          // Normal tab mode - prioritize Address Book avatar if account exists there
          if (activeTab === 'recent' && accountExistsInAddressBook) {
            useLetterAvatar = true; // Use letter avatar for Recent items that exist in Address Book
          } else {
            useLetterAvatar = activeTab === 'contacts';
          }
          showBalanceForAll = activeTab === 'accounts';
        }

        const accountData = item.data as ExtendedWalletAccount;
        const balance = batchBalanceData.get(accountData.address);
        const isLoadingBalance = !batchBalanceData.has(accountData.address) && showBalanceForAll;

        // Check if this account is the selected from account
        const isSelectedFromAccount = selectedFromAccount?.address === accountData.address;

        return (
          <WalletAccountSection
            account={accountData}
            isAccountIncompatible={false}
            onAccountPress={() => handleAccountPress(accountData)}
            showCopyIcon={isContact}
            onCopyPress={isContact ? handleCopyPress : undefined}
            useLetterAvatar={useLetterAvatar}
            balanceData={showBalanceForAll && balance ? balance : undefined}
            isSelectedFromAccount={isSelectedFromAccount}
            showBalance={showBalanceForAll}
            isBalanceLoading={isLoadingBalance}
          />
        );
      }

      case 'unknown-address': {
        // Create a fake account object for the unknown address to use with WalletAccountSection
        const unknownAccount: ExtendedWalletAccount = {
          id: item.address || '',
          name: item.address || '',
          emojiInfo: { emoji: '🔗', name: '', color: '' },
          address: item.address || '',
          isActive: false,
        };

        return (
          <WalletAccountSection
            account={unknownAccount}
            isAccountIncompatible={false}
            onAccountPress={() => handleUnknownAddressPress(item.address || '')}
            showCopyIcon={true} // Show copy icon for unknown addresses
            onCopyPress={handleCopyPress}
            useLetterAvatar={false} // Use emoji avatar
            showBalance={false} // Don't show balance for unknown addresses
            isBalanceLoading={false}
          />
        );
      }

      case 'divider':
        return <View className="my-3" style={dividerStyle} />;

      default:
        return null;
    }
  };
};

/**
 * Get empty state content based on active tab and search query
 */
export const getEmptyStateContent = (
  activeTab: RecipientTabType,
  debouncedSearchQuery: string,
  t: (key: string, options?: any) => string
) => {
  // If searching across all tabs and no results found
  if (debouncedSearchQuery) {
    return {
      title: t('emptyState.noResultsFoundTitle'),
      description: t('emptyState.noResultsFoundDescription', { query: debouncedSearchQuery }),
    };
  }

  // Tab-specific empty states
  switch (activeTab) {
    case 'accounts':
      return {
        title: t('emptyState.noAccountsTitle'),
        description: t('emptyState.noAccountsDescription'),
      };
    case 'recent':
      return {
        title: t('emptyState.noRecentRecipientsTitle'),
        description: t('emptyState.noRecentRecipientsDescription'),
      };
    case 'contacts':
      return {
        title: t('emptyState.noContactsTitle'),
        description: t('emptyState.noContactsDescription'),
      };
    default:
      return {
        title: t('emptyState.noDataTitle'),
        description: t('emptyState.noDataDescription'),
      };
  }
};

/**
 * Render empty state component
 */
export const renderEmptyState = (
  activeTab: RecipientTabType,
  debouncedSearchQuery: string,
  t: (key: string, options?: any) => string
) => {
  const emptyState = getEmptyStateContent(activeTab, debouncedSearchQuery, t);

  return (
    <View className="rounded-xl p-8 items-center">
      <Text
        className="text-fg-1 text-lg font-semibold mb-2 text-center"
        style={{ minWidth: 200 }}
        disableAndroidFix={true}
      >
        {emptyState.title}
      </Text>
      <Text
        className="text-fg-2 text-sm text-center leading-5"
        style={{ minWidth: 200 }}
        disableAndroidFix={true}
      >
        {emptyState.description}
      </Text>
    </View>
  );
};

/**
 * Render skeleton loading rows
 */
export const renderSkeletonRows = (isDark: boolean) => {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}>
      {[1, 2, 3, 4, 5].map(index => (
        <View key={index} style={{ marginBottom: index === 5 ? 0 : 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
            {/* Avatar skeleton */}
            <Skeleton
              isDark={isDark}
              style={{ width: 40, height: 40, borderRadius: 20, marginRight: 16 }}
            />
            <View style={{ flex: 1 }}>
              {/* Name skeleton */}
              <Skeleton isDark={isDark} style={{ height: 16, width: 120, marginBottom: 8 }} />
              {/* Address skeleton */}
              <Skeleton isDark={isDark} style={{ height: 14, width: 200 }} />
            </View>
            {/* Balance/info skeleton */}
            <View style={{ alignItems: 'flex-end' }}>
              <Skeleton isDark={isDark} style={{ height: 16, width: 80, marginBottom: 4 }} />
              <Skeleton isDark={isDark} style={{ height: 12, width: 60 }} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

/**
 * Toast utility function
 */
export const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // For iOS, use a simple alert without buttons for less intrusion
    Alert.alert(message);
  }
};
