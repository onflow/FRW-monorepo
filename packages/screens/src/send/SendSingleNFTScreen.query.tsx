import { bridge, navigation } from '@onflow/frw-context';
import { useSendStore, sendSelectors } from '@onflow/frw-stores';
import {
  BackgroundWrapper,
  YStack,
  ScrollView,
  View,
  NFTSendPreview,
  SendArrowDivider,
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
  ERC1155QuantitySelector,
} from '@onflow/frw-ui';
import {
  logger,
  getNFTCover,
  transformAccountForCard,
  transformAccountForDisplay,
} from '@onflow/frw-utils';
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Query-integrated version of SendSingleNFTScreen following the established pattern
 * Uses TanStack Query for data fetching and caching
 */
export function SendSingleNFTScreen(): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = bridge.getPlatform() === 'extension';

  // Local state for confirmation modal
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [isFreeGasEnabled, setIsFreeGasEnabled] = useState(true);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Get data from send store using selectors
  const selectedNFTs = useSendStore(sendSelectors.selectedNFTs);
  const fromAccount = useSendStore(sendSelectors.fromAccount);
  const toAccount = useSendStore(sendSelectors.toAccount);
  const isLoading = useSendStore(sendSelectors.isLoading);
  const setCurrentStep = useSendStore((state) => state.setCurrentStep);
  const executeTransaction = useSendStore((state) => state.executeTransaction);

  // Get the first selected NFT (should only be one for single NFT flow)
  const selectedNFT = selectedNFTs?.[0] || null;

  // Check if NFT is ERC1155
  const isERC1155 = selectedNFT?.contractType === 'ERC1155';
  const maxQuantity = selectedNFT?.amount || 1;

  // Log ERC1155 detection
  useEffect(() => {
    if (selectedNFT) {
      if (isERC1155) {
        logger.info('[SendSingleNFTScreen] ERC1155 NFT detected:', {
          nftId: selectedNFT.id,
          nftName: selectedNFT.name,
          contractType: selectedNFT.contractType,
          availableAmount: selectedNFT.amount,
          maxQuantity,
        });
      } else {
        logger.info('[SendSingleNFTScreen] Standard NFT detected (non-ERC1155):', {
          nftId: selectedNFT.id,
          nftName: selectedNFT.name,
          contractType: selectedNFT.contractType || 'ERC721',
        });
      }
    }
  }, [selectedNFT, isERC1155, maxQuantity]);

  // Update current step when screen loads
  useEffect(() => {
    setCurrentStep('send-nft');
  }, [setCurrentStep]);

  // Check free gas status
  useEffect(() => {
    const checkFreeGasStatus = async (): Promise<void> => {
      try {
        const isEnabled = await bridge.isFreeGasEnabled?.();
        setIsFreeGasEnabled(isEnabled ?? true);
      } catch (error) {
        // Default to enabled if we can't determine the status
        setIsFreeGasEnabled(true);
      }
    };

    checkFreeGasStatus();
  }, []);

  // Transform NFT data for UI using getNFTCover utility
  const nftImage = selectedNFT ? getNFTCover(selectedNFT) : '';

  const nftForUI: NFTSendData = {
    id: selectedNFT?.id || '',
    name: selectedNFT?.name || 'Untitled',
    image: nftImage,
    collection: selectedNFT?.collectionName || 'Unknown Collection',
    collectionContractName: selectedNFT?.collectionContractName,
    description: selectedNFT?.description || '',
    type: selectedNFT?.type, // Pass the NFT type for EVM badge
  };

  // Calculate if send button should be disabled
  const isSendDisabled = !selectedNFT || !fromAccount || !toAccount || isLoading;

  // Transaction fee data
  const transactionFee = '0.001 FLOW';
  const usdFee = '$0.02';

  // Mock storage warning - TODO: Replace with real storage check
  const showStorageWarning = true;
  const storageWarningMessage =
    'Account balance will fall below the minimum FLOW required for storage after this transaction.';

  // Create form data for transaction confirmation
  const formData: TransactionFormData = {
    tokenAmount: isERC1155 ? selectedQuantity.toString() : '1',
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
  }, []);

  const handleSendPress = useCallback(() => {
    // Log send action with quantity info
    if (isERC1155) {
      logger.info('[SendSingleNFTScreen] Sending ERC1155 NFT with quantity:', {
        quantity: selectedQuantity,
        maxQuantity,
        nftId: selectedNFT?.id,
      });
    } else {
      logger.info('[SendSingleNFTScreen] Sending standard NFT');
    }
    setIsConfirmationVisible(true);
  }, [isERC1155, selectedQuantity, maxQuantity, selectedNFT]);

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
      logger.error('[SendSingleNFTScreen] Transaction failed:', error);
      // Error handling will be managed by the store
    }
  }, [executeTransaction, isExtension]);

  // Early return if essential data is missing
  if (!selectedNFT) {
    return (
      <BackgroundWrapper backgroundColor="$bgDrawer">
        <YStack flex={1} items="center" justify="center" px="$6">
          <Text fontSize="$6" fontWeight="600" color="$color" mb="$3" text="center">
            {t('nft.notFound.title')}
          </Text>
          <Text fontSize="$4" color="$textSecondary" text="center">
            No NFT selected. Please go back and select an NFT to send.
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
          <YStack p={20} gap="$3">
            {/* NFT Section */}
            <YStack px={16} bg="rgba(255, 255, 255, 0.1)" rounded="$4" p="$3" gap="$1">
              {/* From Account Section */}
              {fromAccount && (
                <View mt={-8} mb={-16}>
                  <AccountCard
                    account={transformAccountForCard(fromAccount)}
                    title={t('send.fromAccount')}
                    isLoading={false} // TODO: Real loading state
                  />
                </View>
              )}

              <Separator
                mx="$0"
                my="$0"
                mb="$2"
                borderColor="rgba(255, 255, 255, 0.1)"
                borderWidth={0.5}
              />

              <SendSectionHeader
                title="Send NFTs"
                onEditPress={handleEditNFTPress}
                showEditButton={true}
                editButtonText="Change"
              />

              <View mt={-8} mb={-8}>
                <NFTSendPreview
                  nft={nftForUI}
                  onEditPress={handleEditNFTPress}
                  showEditButton={false} // Header now handles the edit button
                  sectionTitle=""
                  backgroundColor="transparent"
                  borderRadius={0}
                  contentPadding="$0"
                  imageSize="$24"
                />
              </View>

              {/* ERC1155 Quantity Selector */}
              {isERC1155 && (
                <YStack gap="$2" mb="$3">
                  <ERC1155QuantitySelector
                    quantity={selectedQuantity}
                    maxQuantity={maxQuantity}
                    onQuantityChange={(newQuantity) => {
                      logger.info('[SendSingleNFTScreen] ERC1155 quantity changed:', {
                        from: selectedQuantity,
                        to: newQuantity,
                        maxQuantity,
                      });
                      setSelectedQuantity(newQuantity);
                    }}
                    disabled={false}
                  />
                </YStack>
              )}
            </YStack>

            {/* Arrow Down Indicator */}
            <XStack position="relative" height={0} mt="$1">
              <XStack width="100%" position="absolute" t={-40} justify="center">
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

            {/* Transaction Fee and Storage Warning Section */}
            <YStack gap="$3" mt={-16}>
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
        <ConfirmationDrawer
          visible={isConfirmationVisible}
          transactionType="single-nft"
          selectedToken={null}
          selectedNFTs={
            selectedNFT
              ? [
                  {
                    id: selectedNFT.id || '',
                    name: selectedNFT.name || '',
                    image: selectedNFT.thumbnail || '',
                    collection: selectedNFT.collectionName || '',
                    collectionContractName:
                      selectedNFT.collectionContractName || selectedNFT.contractName || '',
                    description: selectedNFT.description || '',
                  },
                ]
              : undefined
          }
          fromAccount={transformAccountForDisplay(fromAccount)}
          toAccount={transformAccountForDisplay(toAccount)}
          formData={formData}
          onConfirm={handleTransactionConfirm}
          onClose={handleConfirmationClose}
          isExtension={isExtension}
        />
      </YStack>
    </BackgroundWrapper>
  );
}
