import { bridge, navigation } from '@onflow/frw-context';
import { useSendStore, sendSelectors } from '@onflow/frw-stores';
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
  XStack,
} from '@onflow/frw-ui';
import {
  logger,
  getNFTCover,
  getNFTId,
  transformAccountForCard,
  transformAccountForDisplay,
} from '@onflow/frw-utils';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Query-integrated version of SendMultipleNFTsScreen following the established pattern
 * Uses TanStack Query for data fetching and caching
 */
export function SendMultipleNFTsScreen(): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = bridge.getPlatform() === 'extension';

  // Local state for confirmation modal
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [isFreeGasEnabled, setIsFreeGasEnabled] = useState(true);

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

  // Check free gas status
  useEffect(() => {
    const checkFreeGasStatus = async () => {
      try {
        const isEnabled = await bridge.isFreeGasEnabled?.();
        setIsFreeGasEnabled(isEnabled ?? true);
      } catch (error) {
        console.error('Failed to check free gas status:', error);
        // Default to enabled if we can't determine the status
        setIsFreeGasEnabled(true);
      }
    };

    checkFreeGasStatus();
  }, []);

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

  // Calculate if send button should be disabled
  const isSendDisabled =
    !selectedNFTs || selectedNFTs.length === 0 || !fromAccount || !toAccount || isLoading;

  // Transaction fee data
  const transactionFee = '0.001 FLOW';
  const usdFee = '$0.02';

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
              {fromAccount && (
                <View mb={-16}>
                  <AccountCard
                    account={transformAccountForCard(fromAccount)}
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
              <View mt={8} pb={16}mb={-8}>
                <MultipleNFTsPreview
                nfts={nftsForUI}
                onRemoveNFT={handleRemoveNFT}
                maxVisibleThumbnails={3}
                expandable={true}
                thumbnailSize={90}
                backgroundColor="transparent"
                borderRadius={14.4}
                contentPadding={0}
                />
              </View>
            </YStack>

            {/* Arrow Down Indicator */}
            <XStack position="relative" height={0} mt="$1">
              <XStack width="100%" position="absolute" t={-40} justify="center">
                <SendArrowDivider variant="arrow" size={48} />
              </XStack>
            </XStack>

            {/* To Account Section */}
            {toAccount && (
               <View mt={-8}>
              <ToAccountSection 
                account={toAccount}
                title={t('send.toAccount')}
                isAccountIncompatible={false} // TODO: Real compatibility check
                onEditPress={handleEditAccountPress}
                onLearnMorePress={handleLearnMorePress}
                showEditButton={true}
                isLinked={toAccount.type === 'child' || !!toAccount.parentAddress}
              />
              </View>
            )}

            {/* Transaction Fee Section */}
            <TransactionFeeSection
              flowFee={transactionFee}
              usdFee={usdFee}
              isFree={isFreeGasEnabled}
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
