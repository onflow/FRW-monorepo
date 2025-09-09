import { bridge, navigation } from '@onflow/frw-context';
import { useSendStore, sendSelectors } from '@onflow/frw-stores';
import { type WalletAccount } from '@onflow/frw-types';
import {
  BackgroundWrapper,
  YStack,
  ScrollView,
  View,
  MultipleNFTsPreview,
  SendArrowDivider,
  TransactionConfirmationModal,
  ConfirmationDrawer,
  TransactionFeeSection,
  ToAccountSection,
  AccountCard,
  SendSectionHeader,
  StorageWarning,
  Text,
  ExtensionHeader,
  Separator,
  type NFTSendData,
  type TransactionFormData,
  type AccountDisplayData,
  XStack,
} from '@onflow/frw-ui';
import { logger, getNFTCover, getNFTId } from '@onflow/frw-utils';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Transform WalletAccount to UI Account type for AccountCard
 */
const transformAccountForCard = (account: WalletAccount | null, balance?: string): any | null => {
  if (!account) return null;

  return {
    name: account.name,
    address: account.address,
    avatar: account.avatar,
    balance: balance || '0 FLOW',
    nfts: '12 NFTs', // TODO: Replace with real NFT count when available
    emojiInfo: account.emojiInfo,
    parentEmoji: account.parentEmoji,
    type: account.type,
  };
};

/**
 * Transform WalletAccount to AccountDisplayData for confirmation drawer
 */
const transformAccountForDisplay = (account: WalletAccount | null): AccountDisplayData | null => {
  if (!account) return null;

  // For Flow accounts, we use emoji instead of avatar image
  const hasEmoji = account.emojiInfo?.emoji;

  return {
    name: account.name,
    address: account.address,
    avatarSrc: hasEmoji ? undefined : account.avatar, // Only use avatar if no emoji
    avatarFallback: hasEmoji ? account.emojiInfo?.emoji || '?' : account.name?.[0] || '?',
    avatarBgColor: account.emojiInfo?.color || '#7B61FF',
    parentEmoji: account.parentEmoji
      ? {
          emoji: account.parentEmoji.emoji,
          name: account.parentEmoji.name,
          color: account.parentEmoji.color,
        }
      : undefined,
    type: account.type,
  };
};

/**
 * Query-integrated version of SendMultipleNFTsScreen following the established pattern
 * Uses TanStack Query for data fetching and caching
 */
export function SendMultipleNFTsScreen(): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = bridge.getPlatform() === 'extension';

  // Local state for confirmation modal
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  // Get data from send store using selectors
  const selectedNFTs = useSendStore(sendSelectors.selectedNFTs);
  const fromAccount = useSendStore(sendSelectors.fromAccount);
  const toAccount = useSendStore(sendSelectors.toAccount);
  const isLoading = useSendStore(sendSelectors.isLoading);
  const setCurrentStep = useSendStore((state) => state.setCurrentStep);
  const setSelectedNFTs = useSendStore((state) => state.setSelectedNFTs);
  const executeTransaction = useSendStore((state) => state.executeTransaction);

  // Update current step when screen loads
  useEffect(() => {
    setCurrentStep('send-nft');
  }, [setCurrentStep]);

  // Transform NFT data for UI using getNFTCover utility
  const nftsForUI: NFTSendData[] = useMemo(
    () =>
      selectedNFTs?.map((nft) => {
        const image = getNFTCover(nft);
        // console.log('[SendMultipleNFTs] NFT image URL:', image);

        return {
          id: nft.id || '',
          name: nft.name || 'Untitled',
          image: image,
          collection: nft.collectionName || 'Unknown Collection',
          collectionContractName: nft.collectionContractName,
          description: nft.description || '',
          type: nft.type, // Pass the NFT type for EVM badge
        };
      }) || [],
    [selectedNFTs]
  );

  // Transform accounts for UI components
  const fromAccountForCard = useMemo(
    () => transformAccountForCard(fromAccount, '550.66 FLOW'), // TODO: Real balance
    [fromAccount]
  );

  // Calculate if send button should be disabled
  const isSendDisabled =
    !selectedNFTs || selectedNFTs.length === 0 || !fromAccount || !toAccount || isLoading;

  // Mock transaction fee data - TODO: Replace with real fee calculation
  const transactionFee = '0.001 FLOW';
  const usdFee = '$0.02';
  const isFeesFree = false;

  // Mock storage warning - TODO: Replace with real storage check
  const showStorageWarning = true;
  const storageWarningMessage =
    'Account balance will fall below the minimum FLOW required for storage after this transaction.';

  // Create form data for transaction confirmation
  const formData: TransactionFormData = {
    tokenAmount: selectedNFTs?.length.toString() || '0',
    fiatAmount: '0.00',
    isTokenMode: true,
    transactionFee,
  };

  // Event handlers
  const handleEditNFTsPress = useCallback(() => {
    // Navigate back to NFT selection screen
    navigation.navigate('NFTList');
  }, []);

  const handleEditAccountPress = useCallback(() => {
    navigation.navigate('SendTo'); // Go back to account selection
  }, []);

  const handleLearnMorePress = useCallback(() => {
    // TODO: Navigate to help/learn more screen
    // console.log('Learn more pressed');
  }, []);

  const handleRemoveNFT = useCallback(
    (nftId: string) => {
      if (!selectedNFTs) return;
      const updatedNFTs = selectedNFTs.filter((nft) => getNFTId(nft) !== nftId);
      setSelectedNFTs(updatedNFTs);

      // If no NFTs remain, navigate back to the NFT selection screen
      if (updatedNFTs.length === 0) {
        // Navigate to NFT selection screen (same as edit button behavior)
        navigation.navigate('NFTList');
      }
      // Stay on the same screen even with 1 NFT remaining
    },
    [selectedNFTs, setSelectedNFTs]
  );

  const handleSendPress = useCallback(() => {
    setIsConfirmationVisible(true);
  }, []);

  const handleConfirmationClose = useCallback(() => {
    setIsConfirmationVisible(false);
  }, []);

  const handleTransactionConfirm = useCallback(async () => {
    try {
      if (!isExtension) {
        setIsConfirmationVisible(false);
      }
      await executeTransaction();
      // Navigation after successful transaction will be handled by the store
    } catch (error) {
      logger.error('[SendMultipleNFTsScreen] Transaction failed:', error);
      // Error handling will be managed by the store
    }
  }, [executeTransaction, isExtension]);

  // Early return if essential data is missing
  if (!selectedNFTs || selectedNFTs.length === 0) {
    return (
      <BackgroundWrapper backgroundColor="$bgDrawer">
        <YStack flex={1} items="center" justify="center" px="$6">
          <Text fontSize="$6" fontWeight="600" color="$color" mb="$3" text="center">
            {t('nft.notFound.title')}
          </Text>
          <Text fontSize="$4" color="$textSecondary" text="center">
            No NFTs selected. Please go back and select NFTs to send.
          </Text>
        </YStack>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper backgroundColor="$bgDrawer">
      <YStack flex={1}>
        {/* Extension Header */}
        {isExtension && (
          <ExtensionHeader
            title={t('send.title')}
            help={true}
            onGoBack={() => navigation.goBack()}
            onNavigate={(link: string) => navigation.navigate(link)}
          />
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack p={20} gap="$4">
            {/* NFT Section */}
            <YStack px={16} bg="rgba(255, 255, 255, 0.1)" rounded="$4" p="$3" gap="$2">
              {/* From Account Section */}
              {fromAccountForCard && (
                <View mb={-16}>
                  <AccountCard
                    account={fromAccountForCard}
                    title={t('send.fromAccount')}
                    isLoading={false} // TODO: Real loading state
                  />
                </View>
              )}

              <Separator mx="$0" my="$0" borderColor="rgba(255, 255, 255, 0.1)" borderWidth={0.5} />

              <SendSectionHeader
                title="Send NFTs"
                onEditPress={handleEditNFTsPress}
                showEditButton={true}
                editButtonText="Change"
              />

              {/* Multiple NFTs Preview with expandable dropdown */}
              <MultipleNFTsPreview
                nfts={nftsForUI}
                onRemoveNFT={handleRemoveNFT}
                maxVisibleThumbnails={3}
                expandable={true}
                thumbnailSize={60}
                backgroundColor="transparent"
                borderRadius={14.4}
                contentPadding={0}
              />
            </YStack>

            {/* Arrow Down Indicator */}
            <XStack position="relative" height={0}>
              <XStack width="100%" position="absolute" t={-30} justify="center">
                <SendArrowDivider variant="arrow" size={48} />
              </XStack>
            </XStack>

            {/* To Account Section */}
            {toAccount && (
              <ToAccountSection
                account={toAccount}
                title={t('send.toAccount')}
                isAccountIncompatible={false} // TODO: Real compatibility check
                onEditPress={handleEditAccountPress}
                onLearnMorePress={handleLearnMorePress}
                showEditButton={true}
                isLinked={toAccount.type === 'child' || !!toAccount.parentAddress}
              />
            )}

            {/* Transaction Fee Section */}
            <TransactionFeeSection
              flowFee={transactionFee}
              usdFee={usdFee}
              isFree={isFeesFree}
              showCovered={true}
              title={t('send.transactionFee')}
              backgroundColor="transparent"
              borderRadius={16}
              contentPadding={0}
            />

            {/* Storage Warning */}
            {showStorageWarning && (
              <StorageWarning
                message={storageWarningMessage}
                showIcon={true}
                title="Storage warning"
                visible={true}
              />
            )}
          </YStack>
        </ScrollView>

        {/* Send Button - Anchored to bottom */}
        <YStack p={20} pt="$2">
          <YStack
            width="100%"
            height={52}
            bg={isSendDisabled ? '#6b7280' : '#FFFFFF'}
            rounded={16}
            items="center"
            justify="center"
            borderWidth={1}
            borderColor={isSendDisabled ? '#6b7280' : '#FFFFFF'}
            opacity={isSendDisabled ? 0.7 : 1}
            pressStyle={{ opacity: 0.9 }}
            onPress={isSendDisabled ? undefined : handleSendPress}
            cursor={isSendDisabled ? 'not-allowed' : 'pointer'}
          >
            <Text fontSize="$4" fontWeight="600" color={isSendDisabled ? '#999' : '#000000'}>
              {t('common.next')}
            </Text>
          </YStack>
        </YStack>

        {/* Transaction Confirmation - Platform specific */}
        {isExtension ? (
          <TransactionConfirmationModal
            visible={isConfirmationVisible}
            transactionType="multiple-nfts"
            selectedToken={null}
            selectedNFTs={nftsForUI}
            fromAccount={transformAccountForDisplay(fromAccount)}
            toAccount={transformAccountForDisplay(toAccount)}
            formData={formData}
            onConfirm={handleTransactionConfirm}
            onClose={handleConfirmationClose}
            title="Confirm NFT Transfer"
          />
        ) : (
          <ConfirmationDrawer
            visible={isConfirmationVisible}
            transactionType="multiple-nfts"
            selectedToken={null}
            selectedNFTs={nftsForUI}
            fromAccount={transformAccountForDisplay(fromAccount)}
            toAccount={transformAccountForDisplay(toAccount)}
            formData={formData}
            onConfirm={handleTransactionConfirm}
            onClose={handleConfirmationClose}
          />
        )}
      </YStack>
    </BackgroundWrapper>
  );
}
