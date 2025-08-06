import { RecentRecipientsService } from '@onflow/frw-services';
import { useSendStore } from '@onflow/frw-stores';
import { type WalletAccount } from '@onflow/frw-types';
import { useCallback, useState } from 'react';
import { Clipboard } from 'react-native';

import { showToast } from '../components/renderHelpers';
import type { RecipientTabType } from '../SendToScreen';
import type { ExtendedWalletAccount } from '../types/recipientTypes';
import { validateSearchAddress } from '../utils/recipientUtils';

interface UseEventHandlersProps {
  navigation: any;
  t: (key: string, options?: any) => string;
  activeTab: RecipientTabType;
  debouncedSearchQuery: string;
  walletAccounts: ExtendedWalletAccount[];
  refreshRecentContacts: () => Promise<void>;
}

export const useEventHandlers = ({
  navigation,
  t,
  activeTab,
  debouncedSearchQuery,
  walletAccounts,
  refreshRecentContacts,
}: UseEventHandlersProps) => {
  const { setToAccount, setCurrentStep } = useSendStore();
  const transactionType = useSendStore(state => state.transactionType);

  // Modal state for first-time send confirmation
  const [showFirstTimeSendModal, setShowFirstTimeSendModal] = useState(false);
  const [pendingRecipient, setPendingRecipient] = useState<{
    type: 'account' | 'address';
    data: ExtendedWalletAccount | string;
  } | null>(null);

  // Navigation helper function
  const navigateToTargetScreen = useCallback(() => {
    if (transactionType === 'tokens') {
      setCurrentStep('send-tokens');
      (navigation as any).navigate('SendTokens');
    } else if (transactionType === 'single-nft') {
      setCurrentStep('send-nft');
      (navigation as any).navigate('SendSingleNFT');
    } else if (transactionType === 'multiple-nfts') {
      setCurrentStep('send-nft');
      (navigation as any).navigate('SendMultipleNFTs');
    } else {
      // Fallback to tokens if transaction type is not set
      setCurrentStep('send-tokens');
      (navigation as any).navigate('SendTokens');
    }
  }, [transactionType, setCurrentStep, navigation]);

  // Handle navigation cleanup and routing
  const handleNavigationCleanup = useCallback(
    (callback: () => void) => {
      try {
        const state = navigation.getState();
        const sendToRoutes = state?.routes.filter((route: any) => route.name === 'SendTo');

        // If we have multiple SendTo screens, go back to remove the current one
        if (sendToRoutes && sendToRoutes.length > 1) {
          navigation.goBack();
          // Use setTimeout to ensure the navigation completes before the next action
          setTimeout(() => {
            callback();
          }, 100);
        } else {
          callback();
        }
      } catch {
        callback();
      }
    },
    [navigation]
  );

  // Helper function to check if address is first-time send
  const isFirstTimeSend = useCallback(
    (address: string): boolean => {
      // Check if address is in recent recipients
      const isInRecents = RecentRecipientsService.getInstance().isAddressInRecents(address);

      // Also check if it's user's own account
      const isOwnAccount = walletAccounts.some(acc => acc.address === address);

      return !isInRecents && !isOwnAccount;
    },
    [walletAccounts]
  );

  // Helper function to proceed with account selection
  const proceedWithAccountSelection = useCallback(
    (account: ExtendedWalletAccount) => {
      console.log('Selected account:', account);
      console.log('Current transaction type:', transactionType);

      // Add to recent recipients in MMKV
      // Skip if it's from My Accounts (user's own accounts), but add for contacts/recent and search results
      const isFromMyAccounts = !debouncedSearchQuery && activeTab === 'accounts';
      const isMyOwnAccount = walletAccounts.some(acc => acc.address === account.address);

      if (!isFromMyAccounts && !isMyOwnAccount) {
        RecentRecipientsService.getInstance().addRecentRecipient({
          id: account.id,
          name: account.name,
          address: account.address,
          emoji: account.emojiInfo?.emoji,
        });

        // Refresh recent contacts list to reflect the new addition
        refreshRecentContacts();
      }

      // Use WalletAccount directly - no conversion needed
      const storeAccount: WalletAccount = account;
      setToAccount(storeAccount);

      // Handle navigation with cleanup
      handleNavigationCleanup(navigateToTargetScreen);
    },
    [
      transactionType,
      debouncedSearchQuery,
      activeTab,
      walletAccounts,
      refreshRecentContacts,
      setToAccount,
      handleNavigationCleanup,
      navigateToTargetScreen,
    ]
  );

  // Account selection handler
  const handleAccountPress = useCallback(
    (account: ExtendedWalletAccount) => {
      // Check if this is a first-time send
      if (isFirstTimeSend(account.address)) {
        // Show confirmation modal for first-time sends
        setPendingRecipient({ type: 'account', data: account });
        setShowFirstTimeSendModal(true);
      } else {
        // Proceed directly for known recipients
        proceedWithAccountSelection(account);
      }
    },
    [isFirstTimeSend, proceedWithAccountSelection]
  );

  // Helper function to proceed with unknown address selection
  const proceedWithUnknownAddressSelection = useCallback(
    (address: string) => {
      console.log('Selected unknown address:', address);
      console.log('Current transaction type:', transactionType);

      // Create a WalletAccount object for the unknown address
      const addressValidation = validateSearchAddress(address);

      // Add to recent recipients in MMKV for future use
      RecentRecipientsService.getInstance().addRecentRecipient({
        id: `unknown-${address}`,
        name: address, // Use address as name for unknown addresses
        address: address,
        emoji: '🔗', // Default emoji for unknown addresses
      });

      // Refresh recent contacts list to reflect the new addition
      refreshRecentContacts();

      // Convert to store format and save to store
      const storeAccount: WalletAccount = {
        id: `unknown-${address}`,
        name: address, // Use address as display name
        emojiInfo: { emoji: '🔗', name: '', color: '' }, // Simple emoji string for unknown addresses
        address: address,
        type: addressValidation.addressType === 'evm' ? 'evm' : 'main',
        isActive: false,
      };

      setToAccount(storeAccount);

      // Handle navigation with cleanup
      handleNavigationCleanup(navigateToTargetScreen);
    },
    [
      transactionType,
      refreshRecentContacts,
      setToAccount,
      handleNavigationCleanup,
      navigateToTargetScreen,
    ]
  );

  // Unknown address selection handler
  const handleUnknownAddressPress = useCallback(
    (address: string) => {
      // Check if this is a first-time send
      if (isFirstTimeSend(address)) {
        // Show confirmation modal for first-time sends
        setPendingRecipient({ type: 'address', data: address });
        setShowFirstTimeSendModal(true);
      } else {
        // Proceed directly for known addresses
        proceedWithUnknownAddressSelection(address);
      }
    },
    [isFirstTimeSend, proceedWithUnknownAddressSelection]
  );

  // Copy functionality handler
  const handleCopyPress = useCallback(
    (address: string) => {
      try {
        Clipboard.setString(address);
        showToast(t('messages.addressCopied'));
      } catch {
        showToast(t('messages.failedToCopyAddress'));
      }
    },
    [t]
  );

  // Edit press handler (placeholder)
  const handleEditPress = useCallback(() => {
    // Handle edit press
  }, []);

  // Modal confirmation handlers
  const handleFirstTimeSendConfirm = useCallback(() => {
    if (pendingRecipient) {
      if (pendingRecipient.type === 'account') {
        proceedWithAccountSelection(pendingRecipient.data as ExtendedWalletAccount);
      } else if (pendingRecipient.type === 'address') {
        proceedWithUnknownAddressSelection(pendingRecipient.data as string);
      }
    }
    setShowFirstTimeSendModal(false);
    setPendingRecipient(null);
  }, [pendingRecipient, proceedWithAccountSelection, proceedWithUnknownAddressSelection]);

  const handleFirstTimeSendCancel = useCallback(() => {
    setShowFirstTimeSendModal(false);
    setPendingRecipient(null);
  }, []);

  return {
    handleAccountPress,
    handleUnknownAddressPress,
    handleCopyPress,
    handleEditPress,
    // Modal state and handlers
    showFirstTimeSendModal,
    pendingRecipient,
    handleFirstTimeSendConfirm,
    handleFirstTimeSendCancel,
  };
};
