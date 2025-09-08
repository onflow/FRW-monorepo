import { bridge, navigation } from '@onflow/frw-context';
import {
  useSendStore,
  sendSelectors,
} from '@onflow/frw-stores';
import { type WalletAccount } from '@onflow/frw-types';
import {
  BackgroundWrapper,
  YStack,
  ScrollView,
  View,
  NFTSendPreview,
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
  Button,
  type NFTDetailData,
  type TransactionFormData,
  type AccountDisplayData,
  XStack,
} from '@onflow/frw-ui';
import { logger } from '@onflow/frw-utils';
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
    avatarFallback: hasEmoji ? (account.emojiInfo?.emoji || '?') : (account.name?.[0] || '?'),
    avatarBgColor: account.emojiInfo?.color || '#7B61FF',
    parentEmoji: account.parentEmoji ? {
      emoji: account.parentEmoji.emoji,
      name: account.parentEmoji.name,
      color: account.parentEmoji.color,
    } : undefined,
    type: account.type,
  };
};

/**
 * Query-integrated version of SendSingleNFTScreen following the established pattern
 * Uses TanStack Query for data fetching and caching
 */
export function SendSingleNFTScreen(): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = bridge.getPlatform() === 'extension';
  const network = bridge.getNetwork() || 'mainnet';

  // Local state for confirmation modal
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  // Get data from send store using selectors
  const selectedNFTs = useSendStore(sendSelectors.selectedNFTs);
  const fromAccount = useSendStore(sendSelectors.fromAccount);
  const toAccount = useSendStore(sendSelectors.toAccount);
  const isLoading = useSendStore(sendSelectors.isLoading);
  const error = useSendStore(sendSelectors.error);
  const setCurrentStep = useSendStore((state) => state.setCurrentStep);
  const executeTransaction = useSendStore((state) => state.executeTransaction);

  // Get the first selected NFT (should only be one for single NFT flow)
  const selectedNFT = selectedNFTs?.[0] || null;

  // Update current step when screen loads
  useEffect(() => {
    setCurrentStep('send-single-nft');
  }, [setCurrentStep]);

  // Early return if essential data is missing
  if (!selectedNFT) {
    return (
      <BackgroundWrapper backgroundColor="$bgDrawer">
        <YStack flex={1} items="center" justify="center" px="$6">
          <Text fontSize="$6" fontWeight="600" color="$color" mb="$3" textAlign="center">
            {t('nft.notFound.title')}
          </Text>
          <Text fontSize="$4" color="$textSecondary" textAlign="center">
            No NFT selected. Please go back and select an NFT to send.
          </Text>
        </YStack>
      </BackgroundWrapper>
    );
  }

  // Transform NFT data for UI
  const nftForUI: NFTDetailData = {
    id: selectedNFT.id,
    name: selectedNFT.name || 'Untitled NFT',
    image: (selectedNFT as any).postMedia?.image || selectedNFT.thumbnail || '',
    collection: selectedNFT.collectionName || 'Unknown Collection',
    collectionContractName: selectedNFT.collectionContractName,
    description: selectedNFT.description || '',
    type: selectedNFT.type, // Pass the NFT type for EVM badge
  };

  // Transform accounts for UI components
  const fromAccountForCard = useMemo(
    () => transformAccountForCard(fromAccount, '550.66 FLOW'), // TODO: Real balance
    [fromAccount]
  );

  // Calculate if send button should be disabled
  const isSendDisabled = !selectedNFT || !fromAccount || !toAccount || isLoading;

  // Mock transaction fee data - TODO: Replace with real fee calculation
  const transactionFee = '0.001 FLOW';
  const usdFee = '$0.02';
  const isFeesFree = false;

  // Mock storage warning - TODO: Replace with real storage check
  const showStorageWarning = true;
  const storageWarningMessage = 'Account balance will fall below the minimum FLOW required for storage after this transaction.';

  // Create form data for transaction confirmation
  const formData: TransactionFormData = {
    tokenAmount: '1',
    fiatAmount: '0.00',
    isTokenMode: true,
    transactionFee,
  };

  // Event handlers
  const handleEditNFTPress = useCallback(() => {
    // Navigate back to NFT selection screen
    // We need to go back twice: SendSingleNFT -> SendTo -> NFTList
    navigation.navigate('NFTList');
  }, []);

  const handleEditAccountPress = useCallback(() => {
    navigation.navigate('SendTo'); // Go back to account selection
  }, []);

  const handleLearnMorePress = useCallback(() => {
    // TODO: Navigate to help/learn more screen
    console.log('Learn more pressed');
  }, []);

  const handleSendPress = useCallback(() => {
    setIsConfirmationVisible(true);
  }, []);

  const handleConfirmationClose = useCallback(() => {
    setIsConfirmationVisible(false);
  }, []);

  const handleTransactionConfirm = useCallback(async () => {
    try {
      setIsConfirmationVisible(false);
      await executeTransaction();
      // Navigation after successful transaction will be handled by the store
    } catch (error) {
      logger.error('[SendSingleNFTScreen] Transaction failed:', error);
      // Error handling will be managed by the store
    }
  }, [executeTransaction]);

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
            <YStack bg="rgba(255, 255, 255, 0.1)" rounded="$4" p="$3" gap="$1">
              {/* From Account Section */}
              {fromAccountForCard && (
                <View mt={-8} mb={-16}>
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
                onEditPress={handleEditNFTPress}
                showEditButton={true}
                editButtonText="Change"
              />
              
              <NFTSendPreview
                nft={nftForUI}
                onEditPress={handleEditNFTPress}
                showEditButton={false} // Header now handles the edit button
                sectionTitle=""
                backgroundColor="transparent"
                borderRadius={0}
                contentPadding="$0"
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
          <Button
            fullWidth={true}
            size="large"
            disabled={isSendDisabled}
            onPress={handleSendPress}
            style={{
              height: 52,
              backgroundColor: isSendDisabled ? '#6b7280' : '#FFFFFF',
              color: isSendDisabled ? '#999' : '#000000',
              borderColor: isSendDisabled ? '#6b7280' : '#FFFFFF',
              borderWidth: 1,
              borderRadius: 16,
              paddingHorizontal: 20,
              paddingVertical: 16,
              shadowColor: 'rgba(16, 24, 40, 0.05)',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isSendDisabled ? 0 : 1,
              shadowRadius: 2,
              elevation: isSendDisabled ? 0 : 1,
              opacity: isSendDisabled ? 0.7 : 1,
            }}
          >
            <Text fontSize="$4" fontWeight="600" color={isSendDisabled ? '#999' : '#000000'}>
              {t('common.next')}
            </Text>
          </Button>
        </YStack>

        {/* Transaction Confirmation - Platform specific */}
        {isExtension ? (
          <TransactionConfirmationModal
            visible={isConfirmationVisible}
            transactionType="single-nft"
            selectedToken={null}
            selectedNFTs={selectedNFT ? [{
              id: selectedNFT.id || '',
              name: selectedNFT.name || '',
              image: selectedNFT.thumbnail || '',
              collection: selectedNFT.collectionName || '',
              collectionContractName: selectedNFT.collectionContractName || selectedNFT.contractName || '',
              description: selectedNFT.description || '',
            }] : undefined}
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
            transactionType="single-nft"
            selectedToken={null}
            selectedNFTs={selectedNFT ? [{
              id: selectedNFT.id || '',
              name: selectedNFT.name || '',
              image: selectedNFT.thumbnail || '',
              collection: selectedNFT.collectionName || '',
              collectionContractName: selectedNFT.collectionContractName || selectedNFT.contractName || '',
              description: selectedNFT.description || '',
            }] : undefined}
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