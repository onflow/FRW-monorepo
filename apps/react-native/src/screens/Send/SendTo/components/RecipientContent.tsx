import { useTheme } from '@/contexts/ThemeContext';
import React, { useCallback, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { sendSelectors, useSendStore } from '@/stores';
import { FirstTimeSendModal } from '@/components/ui/modals';
import { AlphabetIndex } from './AlphabetIndex';
import type {
  RecipientContentProps,
  ListItem,
  ExtendedWalletAccount,
} from '../types/recipientTypes';
import {
  generateAccountsListData,
  generateRecentListData,
  generateContactsListData,
  generateSearchAllTabsData,
  selectListData,
} from '../utils/listDataGenerators';
import { createRenderItem, renderEmptyState, renderSkeletonRows } from './renderHelpers';
import { useEventHandlers } from '../hooks/useEventHandlers';
import { useDataLoader } from '../hooks/useDataLoader';

// Container style constant for better performance - adjusted to match Figma specs
const CONTAINER_STYLE = { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 };
const CONTAINER_STYLE_WITH_INDEX = {
  paddingLeft: 20,
  paddingRight: 40,
  paddingTop: 16,
  paddingBottom: 20,
}; // +42px for AlphabetIndex

export const RecipientContent: React.FC<RecipientContentProps> = React.memo(
  ({ activeTab, searchQuery, navigation }) => {
    const { t } = useTranslation();
    const { isDark } = useTheme();

    // Get selected from account from send store
    const selectedFromAccount = useSendStore(sendSelectors.fromAccount);

    // Data loading using extracted hook
    const {
      addressBookContacts,
      recentContacts,
      walletAccounts,
      isAccountsLoading,
      isRecentLoading,
      isContactsLoading,
      accountsLoadingData,
      batchBalanceData,
      refreshRecentContacts,
    } = useDataLoader(t);

    // Alphabet index state
    const [activeIndexLetter, setActiveIndexLetter] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);

    // Theme-aware divider style - matches Figma design
    const dividerStyle = useMemo(
      () => ({
        height: 1,
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      }),
      [isDark]
    );

    // State management - modal not needed since we navigate directly

    // Debounced search query to reduce frequent re-renders
    const debouncedSearchQuery = useMemo(() => {
      return searchQuery; // Simplified, can add debouncing later if needed
    }, [searchQuery]);

    // Generate list data using extracted functions
    const accountsListData = useMemo(
      () => generateAccountsListData(walletAccounts, debouncedSearchQuery),
      [walletAccounts, debouncedSearchQuery]
    );

    const recentListData = useMemo(
      () => generateRecentListData(recentContacts, debouncedSearchQuery),
      [recentContacts, debouncedSearchQuery]
    );

    const contactsListData = useMemo(
      () => generateContactsListData(addressBookContacts, debouncedSearchQuery),
      [addressBookContacts, debouncedSearchQuery]
    );

    const searchAllTabsData = useMemo(
      () =>
        generateSearchAllTabsData(
          debouncedSearchQuery,
          walletAccounts,
          recentContacts,
          addressBookContacts,
          t
        ),
      [debouncedSearchQuery, walletAccounts, recentContacts, addressBookContacts, t]
    );

    // Select appropriate list data
    const listData = useMemo(
      () =>
        selectListData(
          debouncedSearchQuery,
          activeTab,
          accountsListData,
          recentListData,
          contactsListData,
          searchAllTabsData
        ),
      [
        debouncedSearchQuery,
        activeTab,
        accountsListData,
        recentListData,
        contactsListData,
        searchAllTabsData,
      ]
    );

    // Extract alphabet letters for contacts tab
    const alphabetLetters = useMemo(() => {
      if (activeTab !== 'contacts' || debouncedSearchQuery) return [];
      return listData
        .filter(item => item.type === 'header')
        .map(item => item.title!)
        .sort();
    }, [activeTab, debouncedSearchQuery, listData]);

    // Set default active letter to first letter when alphabet letters change
    React.useEffect(() => {
      if (alphabetLetters.length > 0 && !activeIndexLetter) {
        setActiveIndexLetter(alphabetLetters[0]);
      } else if (alphabetLetters.length === 0) {
        setActiveIndexLetter(null);
      }
    }, [alphabetLetters, activeIndexLetter]);

    // Handle alphabet index press
    const handleAlphabetPress = useCallback(
      (letter: string) => {
        const headerIndex = listData.findIndex(
          item => item.type === 'header' && item.title === letter
        );
        if (headerIndex !== -1 && flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: headerIndex,
            animated: true,
            viewPosition: 0,
          });
          setActiveIndexLetter(letter);
        }
      },
      [listData]
    );

    // Handle scroll to update active letter
    const handleScroll = useCallback(
      (_event: { nativeEvent: { contentOffset: { y: number } } }) => {
        if (activeTab !== 'contacts' || debouncedSearchQuery) return;

        // This is a simplified version - you might want to implement more precise logic
        // based on the actual positions of headers and scroll position
      },
      [activeTab, debouncedSearchQuery]
    );

    // Event handlers using extracted hook
    const {
      handleAccountPress,
      handleUnknownAddressPress,
      handleCopyPress,
      handleEditPress,
      showFirstTimeSendModal,
      pendingRecipient,
      handleFirstTimeSendConfirm,
      handleFirstTimeSendCancel,
    } = useEventHandlers({
      navigation,
      t,
      activeTab,
      debouncedSearchQuery,
      walletAccounts,
      refreshRecentContacts,
    });

    // Create render item function using extracted helper
    const renderItem = useCallback(
      createRenderItem({
        isDark,
        t,
        debouncedSearchQuery,
        activeTab,
        accountsLoadingData,
        batchBalanceData,
        addressBookContacts,
        dividerStyle,
        handleEditPress,
        handleAccountPress,
        handleUnknownAddressPress,
        handleCopyPress,
        selectedFromAccount,
      }),
      [
        isDark,
        t,
        debouncedSearchQuery,
        activeTab,
        accountsLoadingData,
        batchBalanceData,
        addressBookContacts,
        dividerStyle,
        handleEditPress,
        handleAccountPress,
        handleUnknownAddressPress,
        handleCopyPress,
        selectedFromAccount,
      ]
    );

    // Empty state renderer using extracted helper
    const emptyStateRenderer = useCallback(
      () => renderEmptyState(activeTab, debouncedSearchQuery, t),
      [activeTab, debouncedSearchQuery, t]
    );

    // Optimized keyExtractor
    const keyExtractor = useCallback((item: ListItem) => item.id, []);

    // Skeleton loading component using extracted helper
    const skeletonRenderer = useCallback(() => renderSkeletonRows(isDark), [isDark]);

    // Determine if we should show loading based on active tab and search state
    const shouldShowLoading = useMemo(() => {
      if (debouncedSearchQuery) {
        // In search mode, show loading if any tab is loading
        return isAccountsLoading || isRecentLoading || isContactsLoading;
      }

      // In tab mode, show loading based on active tab
      switch (activeTab) {
        case 'accounts':
          return isAccountsLoading;
        case 'recent':
          return isRecentLoading;
        case 'contacts':
          return isContactsLoading;
        default:
          return false;
      }
    }, [activeTab, debouncedSearchQuery, isAccountsLoading, isRecentLoading, isContactsLoading]);

    // Show skeleton loading
    if (shouldShowLoading) {
      return <View className="flex-1">{skeletonRenderer()}</View>;
    }

    if (listData.length === 0) {
      return (
        <View className="flex-1 px-4" style={CONTAINER_STYLE}>
          {emptyStateRenderer()}
        </View>
      );
    }

    return (
      <View className="flex-1">
        {/* Divider - only show when there's content */}
        <View className="mb-2 mx-5" style={dividerStyle} />
        <FlatList
          ref={flatListRef}
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            activeTab === 'contacts' && !debouncedSearchQuery && alphabetLetters.length > 0
              ? CONTAINER_STYLE_WITH_INDEX
              : CONTAINER_STYLE
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />

        {/* Alphabet Index - only show for contacts tab without search */}
        {activeTab === 'contacts' && !debouncedSearchQuery && alphabetLetters.length > 0 && (
          <AlphabetIndex
            letters={alphabetLetters}
            activeIndex={activeIndexLetter}
            onLetterPress={handleAlphabetPress}
          />
        )}

        {/* First Time Send Confirmation Modal */}
        <FirstTimeSendModal
          visible={showFirstTimeSendModal}
          onClose={handleFirstTimeSendCancel}
          onConfirm={handleFirstTimeSendConfirm}
          recipientAddress={
            pendingRecipient
              ? pendingRecipient.type === 'account'
                ? (pendingRecipient.data as ExtendedWalletAccount).address
                : (pendingRecipient.data as string)
              : ''
          }
          recipientName={
            pendingRecipient && pendingRecipient.type === 'account'
              ? (pendingRecipient.data as ExtendedWalletAccount).name
              : undefined
          }
        />
      </View>
    );
  }
);

RecipientContent.displayName = 'RecipientContent';
