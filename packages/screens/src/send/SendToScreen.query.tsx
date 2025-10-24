import { AddressbookService } from '@onflow/frw-api';
import { bridge, navigation, toast } from '@onflow/frw-context';
import { RecentRecipientsService } from '@onflow/frw-services';
import {
  useSendStore,
  useProfileStore,
  useAllProfiles,
  useAddressBookStore,
  addressBookQueryKeys,
  tokenQueries,
  tokenQueryKeys,
} from '@onflow/frw-stores';
import type { WalletAccount } from '@onflow/frw-types';
import {
  SearchableTabLayout,
  RecipientList,
  AddressBookList,
  ProfileList,
  type RecipientData,
  ExtensionHeader,
  BackgroundWrapper,
  InfoDialog,
  Text,
  YStack,
  AddContactDialog,
} from '@onflow/frw-ui';
import {
  isValidEthereumAddress,
  isValidFlowAddress,
  logger,
  retryConfigs,
} from '@onflow/frw-utils';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
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
  const cardBackgroundColor = '$cardBg';

  const TABS: TabConfig[] = [
    { type: 'accounts', title: t('send.myAccounts') },
    { type: 'recent', title: t('send.recent') },
    { type: 'contacts', title: t('send.addressBook') },
  ];

  const { setToAccount, setFromAccount, fromAccount } = useSendStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<RecipientTabType>('accounts');
  // Track copied entry uniquely by name+address to avoid highlighting duplicates
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // First time send modal state
  const [showFirstTimeSendDialog, setShowFirstTimeSendDialog] = useState(false);
  const [pendingRecipient, setPendingRecipient] = useState<RecipientData | null>(null);
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [pendingAddressBookRecipient, setPendingAddressBookRecipient] =
    useState<RecipientData | null>(null);
  const [isAddingToAddressBook, setIsAddingToAddressBook] = useState(false);
  const [contactNameInput, setContactNameInput] = useState('');

  const pendingRecipientInitial = useMemo(() => {
    if (!pendingAddressBookRecipient) {
      return '?';
    }

    const nameInitial = pendingAddressBookRecipient.name?.trim()?.[0];
    if (nameInitial) {
      return nameInitial.toUpperCase();
    }

    const address = pendingAddressBookRecipient.address?.replace(/^0x/, '');
    return address?.[0]?.toUpperCase() ?? '?';
  }, [pendingAddressBookRecipient]);

  // Get selected token from send store
  const transactionType = useSendStore((state) => state.transactionType);
  const setCurrentStep = useSendStore((state) => state.setCurrentStep);

  // Update current step when screen loads
  useEffect(() => {
    setCurrentStep('send-to');
  }, [setCurrentStep]);

  // Get all profiles with their accounts - using stable hook
  const allProfiles = useAllProfiles();
  const loadProfilesFromBridge = useProfileStore((state) => state.loadProfilesFromBridge);

  const addressBookStore = useAddressBookStore();

  // Initialize profiles on mount (only if not already loaded)
  const isLoadingProfiles = useProfileStore((state) => state.isLoading);
  const profileError = useProfileStore((state) => state.error);
  const profilesLoadedRef = useRef(false);

  const bridgeAddress = bridge.getSelectedAddress() || '';
  const fromAddress = fromAccount?.address || bridgeAddress;
  const network = bridge.getNetwork() || 'mainnet';

  useEffect(() => {
    // Only load if we haven't loaded yet and we're not currently loading
    if (!profilesLoadedRef.current && !isLoadingProfiles && !profileError) {
      profilesLoadedRef.current = true;
      loadProfilesFromBridge();
    }
  }, [isLoadingProfiles, loadProfilesFromBridge, profileError]);

  // Query for recent contacts with automatic caching
  const { data: recentContacts = [], isLoading: isLoadingRecent } = useQuery({
    queryKey: addressBookQueryKeys.recent(),
    queryFn: () => addressBookStore.fetchRecent(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for all contacts with automatic caching
  const {
    data: allContacts = [],
    isLoading: isLoadingContacts,
    error: contactsError,
    refetch: refetchContacts,
  } = useQuery({
    queryKey: addressBookQueryKeys.contacts(),
    queryFn: () => addressBookStore.fetchContacts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for account balances using batch API - use profile accounts
  const profileAccountAddresses = useMemo(() => {
    return allProfiles.flatMap((profile) => profile.accounts.map((account) => account.address));
  }, [allProfiles]);

  const { data: batchBalances = [] } = useQuery({
    queryKey: ['batchBalances', profileAccountAddresses],
    queryFn: () => tokenQueries.fetchBatchFlowBalances(profileAccountAddresses),
    enabled: profileAccountAddresses.length > 0,
    staleTime: 30 * 1000, // Cache for 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 60 * 1000, // Refresh every minute
    ...retryConfigs.critical, // Critical batch balance data retry config
  });

  // 🔥 TanStack Query: Fetch balance with stale-while-revalidate pattern and retry logic
  const { data: balanceData } = useQuery({
    queryKey: tokenQueryKeys.balance(fromAddress, network),
    queryFn: () => tokenQueries.fetchBalance(fromAddress, undefined, network),
    enabled: !!fromAccount?.address,
    staleTime: 30 * 1000, // Use cached balance for 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 60 * 1000, // Refresh balance every minute in background
    ...retryConfigs.critical, // Critical balance data retry config
  });
  // Convert batch balances and NFT counts to the expected format
  const accountBalances = useMemo(() => {
    const results: { [address: string]: { balance: string; nftCount: string } } = {};

    // Create a lookup map from batch results
    const balanceLookup = new Map<string, string>();
    batchBalances.forEach(([address, balance]) => {
      balanceLookup.set(address, balance);
    });

    // Map to expected format with both balance and NFT count for all profile accounts
    profileAccountAddresses.forEach((address) => {
      const balance = balanceLookup.get(address) || '0 FLOW';
      results[address] = {
        balance,
        nftCount: '0',
      };
    });

    return results;
  }, [batchBalances, profileAccountAddresses]);

  // Filter function for search
  const filterBySearchQuery = useCallback(
    (name: string, address: string): boolean => {
      if (!searchQuery || !searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return name.toLowerCase().includes(query) || address.toLowerCase().includes(query);
    },
    [searchQuery]
  );

  // Convert and filter recent contacts data
  const recentData = useMemo((): RecipientData[] => {
    return recentContacts
      .map((contact: any) => ({
        id: contact.id,
        name: contact.name,
        address: contact.address,
        avatar: contact.avatar,
        type: 'recent' as const,
        emojiInfo: null,
        parentEmojiInfo: null,
      }))
      .filter((contact) => filterBySearchQuery(contact.name, contact.address));
  }, [recentContacts, filterBySearchQuery]);

  // Convert and filter contacts data
  const contactsData = useMemo((): RecipientData[] => {
    return allContacts
      .map((contact: any) => ({
        id: contact.id,
        name: contact.name,
        address: contact.address,
        avatar: contact.avatar,
        type: 'contact' as const,
        emojiInfo: null,
        parentEmojiInfo: null,
      }))
      .filter((contact) => filterBySearchQuery(contact.name, contact.address));
  }, [allContacts, isLoadingContacts, contactsError, filterBySearchQuery]);

  const contactsErrorMessage = useMemo(() => {
    if (!contactsError) {
      return undefined;
    }
    if (contactsError instanceof Error) {
      return contactsError.message;
    }
    return String(contactsError);
  }, [contactsError]);

  // Create a set of existing addresses for quick lookup
  const existingAddresses = useMemo(() => {
    return new Set(allContacts.map((contact: any) => contact.address?.toLowerCase()));
  }, [allContacts]);

  // Helper function to check if address already exists in address book
  const isAddressInAddressBook = useCallback(
    (address: string) => {
      return existingAddresses.has(address?.toLowerCase());
    },
    [existingAddresses]
  );

  // Convert and filter profiles data for display
  const profilesData = useMemo(() => {
    const result = allProfiles.map((profile) => ({
      ...profile,
      accounts: profile.accounts
        .map((account) => ({
          ...account,
          balance: accountBalances[account.address]?.balance || '0 FLOW',
        }))
        .filter((account) => filterBySearchQuery(account.name || '', account.address)),
    }));
    // Only return profiles that have at least one matching account
    return result.filter((profile) => profile.accounts.length > 0);
  }, [allProfiles, accountBalances, filterBySearchQuery]);

  // Get all wallet accounts for first time send check
  const allWalletAccounts = useMemo(() => {
    return allProfiles.flatMap((profile) => profile.accounts);
  }, [allProfiles]);

  // Helper function to check if address is first-time send
  const isFirstTimeSend = useCallback(
    (address: string): boolean => {
      const normalizedAddress = address.toLowerCase();

      // Check if it's user's own account (case-insensitive comparison)
      const isOwnAccount = allWalletAccounts.some(
        (acc) => acc.address.toLowerCase() === normalizedAddress
      );

      // Check if address is in recent recipients
      const isInRecents = recentContacts.some(
        (contact: any) => contact.address.toLowerCase() === normalizedAddress
      );

      // Check if address is in address book
      const isInAddressBook = allContacts.some(
        (contact: any) => contact.address.toLowerCase() === normalizedAddress
      );

      // Return true only if it's NOT in any of the above categories
      return !isOwnAccount && !isInRecents && !isInAddressBook;
    },
    [allWalletAccounts, recentContacts, allContacts]
  );

  // Get current recipients based on active tab
  const recipients = useMemo(() => {
    switch (activeTab) {
      case 'recent':
        return recentData;
      case 'contacts':
        return contactsData;
      default:
        return [];
    }
  }, [activeTab, recentData, contactsData]);

  // Get loading state for current tab
  const isLoading = useMemo(() => {
    switch (activeTab) {
      case 'accounts':
        return isLoadingProfiles;
      case 'recent':
        return isLoadingRecent;
      case 'contacts':
        return isLoadingContacts;
      default:
        return false;
    }
  }, [activeTab, isLoadingProfiles, isLoadingRecent, isLoadingContacts]);

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

  // Helper function to proceed with recipient selection
  const proceedWithRecipientSelection = useCallback(
    async (recipient: RecipientData) => {
      // Determine the correct account type
      let accountType: 'main' | 'child' | 'evm' | undefined;
      if (recipient.isEVM) {
        accountType = 'evm';
      } else if (recipient.isLinked) {
        accountType = 'child';
      } else if (recipient.type === 'account') {
        accountType = 'main';
      }

      logger.debug('fromAccount selected', fromAccount, balanceData);

      const emojiValue = recipient.emojiInfo?.emoji;
      const isRealEmoji = emojiValue && !emojiValue.startsWith('http') && emojiValue.length <= 4;

      setToAccount({
        id: recipient.id,
        name: recipient.name,
        address: recipient.address,
        avatar: isRealEmoji ? undefined : recipient.avatar || '',
        emojiInfo: isRealEmoji ? recipient.emojiInfo : undefined,
        parentEmoji: recipient.parentEmojiInfo,
        parentAddress: recipient.isLinked ? recipient.address : undefined, // If linked, store parent info
        isActive: false,
        type: accountType,
      });

      if (fromAccount) {
        setFromAccount({
          ...fromAccount,
          balance: balanceData?.displayBalance || '0 FLOW',
          nfts: balanceData?.nftCount ? `${balanceData.nftCount} NFTs` : '0 NFTs',
        });
      }

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
      if (transactionType === 'single-nft' || transactionType === 'multiple-nfts') {
        // Use the shared SendSummary screen for both single and multiple NFTs
        navigation.navigate('SendSummary', { address: recipient.address, recipient });
      } else {
        // Default to tokens screen
        navigation.navigate('SendTokens', { address: recipient.address, recipient });
      }
    },
    [setToAccount, activeTab, transactionType, fromAccount, balanceData]
  );

  // Dialog handlers
  const handleFirstTimeSendConfirm = useCallback(async () => {
    if (pendingRecipient) {
      await proceedWithRecipientSelection(pendingRecipient);
    }
    setShowFirstTimeSendDialog(false);
    setPendingRecipient(null);
  }, [pendingRecipient, proceedWithRecipientSelection]);

  const handleFirstTimeSendCancel = useCallback(() => {
    setShowFirstTimeSendDialog(false);
    setPendingRecipient(null);
  }, []);

  const handleRecipientPress = useCallback(
    async (recipient: RecipientData) => {
      // Check if this is a first-time send
      const shouldShowDialog = isFirstTimeSend(recipient.address);

      if (shouldShowDialog) {
        // Show confirmation dialog for first-time sends
        setPendingRecipient(recipient);
        setShowFirstTimeSendDialog(true);
      } else {
        // Proceed directly for known recipients
        await proceedWithRecipientSelection(recipient);
      }
    },
    [isFirstTimeSend, proceedWithRecipientSelection]
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
          // Add a small delay to prevent immediate action while user might still be typing/pasting
          const timer = setTimeout(() => {
            // Find matching account from the profile accounts
            let matchingAccount: WalletAccount | undefined = undefined;
            for (const profile of allProfiles) {
              matchingAccount = profile.accounts.find(
                (account) =>
                  account.address.toLowerCase() === trimmedValue.toLowerCase() ||
                  account.address === trimmedValue
              );
              if (matchingAccount) break;
            }

            // Create recipient data
            const recipient: RecipientData = {
              id: trimmedValue,
              name: matchingAccount?.name || t('send.unknownAccount'),
              address: trimmedValue,
              avatar: matchingAccount?.emojiInfo ? undefined : matchingAccount?.avatar,
              emojiInfo: matchingAccount?.emojiInfo,
              parentEmojiInfo: matchingAccount?.parentEmoji || null,
              type: 'account' as const,
              isSelected: false,
              isLinked: !!(matchingAccount?.parentAddress || matchingAccount?.type === 'child'),
              isEVM: isEvmAddress,
              balance: '',
              showBalance: false,
            };

            // Auto-navigate to the next screen (will trigger firstTimeSend check)
            handleRecipientPress(recipient);
          }, 300); // 300ms delay to allow for complete address input

          return () => clearTimeout(timer);
        }
      }
    },
    [allProfiles, handleRecipientPress]
  );

  const handleScanPress = useCallback(async () => {
    try {
      const scannedText = await bridge.scanQRCode();
      if (scannedText) {
        handleSearchChange(scannedText);
      }
    } catch (error: any) {
      // Don't show alert for cancelled scans
      if (error.code !== 'SCAN_CANCELLED') {
        alert(`${t('common.error')}: ${t('errors.networkError')}`);
      }
    }
  }, [handleSearchChange, t]);

  const handleRecipientEdit = useCallback((_recipient: RecipientData) => {
    // TODO: Handle edit recipient
  }, []);

  const handleRecipientCopy = useCallback(async (recipient: RecipientData) => {
    try {
      // Check platform and use appropriate clipboard method
      const platform = bridge.getPlatform();

      // Use RN clipboard via global injected helper when not web/extension
      if (platform !== 'extension' && typeof window === 'undefined') {
        const rnClipboard = (globalThis as any).clipboard;
        if (rnClipboard?.setString) {
          rnClipboard.setString(recipient.address);
        }
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(recipient.address);
      }

      // Set both string key and stable id to scope feedback precisely
      setCopiedAddress(`${recipient.name}::${recipient.address}`);
      setCopiedId(recipient.id);
      setTimeout(() => {
        setCopiedAddress(null);
        setCopiedId(null);
      }, 1000);
    } catch (error) {
      logger.error('Failed to copy address:', error);
    }
  }, []);

  const handleRecipientAddToAddressBook = useCallback(
    (recipient: RecipientData) => {
      logger.debug('[SendToScreen] Adding recipient to address book:', recipient);
      setPendingAddressBookRecipient(recipient);
      setShowAddContactDialog(true);
      setContactNameInput(recipient.name || '');
    },
    [isAddressInAddressBook]
  );

  const handleAddToAddressBookCancel = useCallback(() => {
    setShowAddContactDialog(false);
    setPendingAddressBookRecipient(null);
    setIsAddingToAddressBook(false);
    setContactNameInput('');
  }, []);

  const handleAddToAddressBookConfirm = useCallback(async () => {
    if (!pendingAddressBookRecipient || isAddingToAddressBook) {
      return;
    }

    try {
      setIsAddingToAddressBook(true);
      const trimmedName = contactNameInput.trim();
      const contactName =
        trimmedName || pendingAddressBookRecipient.name || pendingAddressBookRecipient.address;

      await AddressbookService.external({
        contactName,
        address: pendingAddressBookRecipient.address,
        domain: '',
        domainType: 0,
      });

      await refetchContacts();
      toast.show({
        title: t('messages.addressBookAdded'),
        type: 'success',
      });
    } catch (error) {
      logger.error('Failed to add to address book:', error);
      toast.show({
        title: t('messages.failedToAddToAddressBook'),
        type: 'error',
      });
    } finally {
      setIsAddingToAddressBook(false);
      setShowAddContactDialog(false);
      setPendingAddressBookRecipient(null);
      setContactNameInput('');
    }
  }, [pendingAddressBookRecipient, isAddingToAddressBook, contactNameInput, refetchContacts]);

  const shouldShowAddToAddressBook = useCallback(
    (recipient: RecipientData) => {
      if (!recipient?.address) {
        return false;
      }

      if (recipient.type === 'contact') {
        return false;
      }

      return !isAddressInAddressBook(recipient.address);
    },
    [isAddressInAddressBook]
  );

  const getEmptyStateForTab = () => {
    // If there's a search query, show search-specific empty states
    if (searchQuery && searchQuery.trim()) {
      return {
        title: t('send.noSearchResults.title', 'No Results'),
        message: t(
          'send.noSearchResults.message',
          `No accounts or contacts match "${searchQuery}"`
        ),
      };
    }

    // Default empty states for each tab
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
    <BackgroundWrapper backgroundColor="$bgDrawer" px={'$0' as any} pb={'$0' as any}>
      {isExtension && (
        <ExtensionHeader
          title={t('send.sendTo.title', 'Send To')}
          help={true}
          onGoBack={() => navigation.goBack()}
          onNavigate={(link: string) => navigation.navigate(link)}
        />
      )}
      <SearchableTabLayout
        title={t('send.sendTo.title')}
        searchValue={searchQuery}
        searchPlaceholder={t('send.searchPasteAddress')}
        showScanButton={!isExtension}
        onSearchChange={handleSearchChange}
        onScanPress={handleScanPress}
        tabSegments={tabTitles}
        activeTab={getTitleByType(activeTab)}
        onTabChange={handleTabChange}
        backgroundColor="$bgDrawer"
        headerPaddingHorizontal={'$4'}
      >
        {activeTab === 'accounts' ? (
          <ProfileList
            profiles={profilesData}
            onAccountPress={handleRecipientPress}
            isLoading={isLoading}
            emptyTitle={emptyState.title}
            emptyMessage={emptyState.message}
            loadingText={t('messages.loadingProfiles')}
            isMobile={!isExtension}
            currentAccount={fromAccount ?? undefined}
          />
        ) : activeTab === 'contacts' ? (
          contactsErrorMessage ? (
            <RecipientList
              data={[]}
              isLoading={false}
              emptyTitle={emptyState.title}
              emptyMessage={emptyState.message}
              error={contactsErrorMessage}
              retryButtonText={t('buttons.retry')}
              errorDefaultMessage={t('messages.failedToLoadRecipients')}
              onRetry={refetchContacts}
              shouldShowAddToAddressBook={shouldShowAddToAddressBook}
            />
          ) : isLoadingContacts ? (
            <RecipientList
              data={[]}
              isLoading={true}
              emptyTitle={emptyState.title}
              emptyMessage={emptyState.message}
              retryButtonText={t('buttons.retry')}
              errorDefaultMessage={t('messages.failedToLoadRecipients')}
              shouldShowAddToAddressBook={shouldShowAddToAddressBook}
            />
          ) : contactsData.length === 0 ? (
            <RecipientList
              data={[]}
              isLoading={false}
              emptyTitle={emptyState.title}
              emptyMessage={emptyState.message}
              retryButtonText={t('buttons.retry')}
              errorDefaultMessage={t('messages.failedToLoadRecipients')}
              shouldShowAddToAddressBook={shouldShowAddToAddressBook}
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
              copiedAddress={copiedAddress}
              copiedId={copiedId}
              copiedText={t('messages.copied')}
              isMobile={!isExtension}
            />
          )
        ) : (
          <RecipientList
            data={recipients}
            isLoading={isLoading}
            emptyTitle={emptyState.title}
            emptyMessage={emptyState.message}
            retryButtonText={t('buttons.retry')}
            errorDefaultMessage={t('messages.failedToLoadRecipients')}
            onItemPress={handleRecipientPress}
            onItemEdit={handleRecipientEdit}
            onItemCopy={handleRecipientCopy}
            onItemAddToAddressBook={handleRecipientAddToAddressBook}
            shouldShowAddToAddressBook={shouldShowAddToAddressBook}
          />
        )}
      </SearchableTabLayout>

      <AddContactDialog
        visible={showAddContactDialog}
        address={pendingAddressBookRecipient?.address || ''}
        initial={pendingRecipientInitial}
        contactName={contactNameInput}
        isSubmitting={isAddingToAddressBook}
        onContactNameChange={setContactNameInput}
        onConfirm={handleAddToAddressBookConfirm}
        onClose={handleAddToAddressBookCancel}
        title={t('send.newContactTitle')}
        nameLabel={t('send.contactNameLabel')}
        namePlaceholder={t('send.contactNamePlaceholder')}
        confirmLabel={t('send.addToAddressBookButton')}
      />

      {/* First Time Send Confirmation Dialog */}
      <InfoDialog
        visible={showFirstTimeSendDialog}
        title={t('send.confirmAddress')}
        buttonText={t('send.confirmAddress')}
        onButtonClick={handleFirstTimeSendConfirm}
        onClose={handleFirstTimeSendCancel}
      >
        <YStack gap="$5" self="stretch" items="center">
          {/* Body Text */}
          <Text
            fontSize="$3"
            fontWeight="300"
            lineHeight={20}
            letterSpacing={-0.084}
            textAlign="center"
            color="$text"
            self="stretch"
          >
            {t('send.firstTimeSendMessage')}
          </Text>

          {/* Address Container */}
          <YStack
            bg={cardBackgroundColor}
            rounded="$2"
            py="$4"
            px="$6"
            items="center"
            justify="center"
            self="stretch"
          >
            <Text
              fontSize="$3"
              fontWeight="600"
              lineHeight={16.8}
              letterSpacing={-0.084}
              textAlign="center"
              color="$text"
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {pendingRecipient?.address || ''}
            </Text>
          </YStack>
        </YStack>
      </InfoDialog>
    </BackgroundWrapper>
  );
}
