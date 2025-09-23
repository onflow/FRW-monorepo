import { bridge, navigation } from '@onflow/frw-context';
import {
  useSendStore,
  sendSelectors,
  storageQueryKeys,
  storageQueries,
  storageUtils,
  useTokenQueryStore,
} from '@onflow/frw-stores';
import { Platform } from '@onflow/frw-types';
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
import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { ScreenAssets } from '../assets/images';

interface SendSingleNFTScreenProps {
  assets?: ScreenAssets;
}

/**
 * Query-integrated version of SendSingleNFTScreen following the established pattern
 * Uses TanStack Query for data fetching and caching
 */
export function SendSingleNFTScreen({ assets }: SendSingleNFTScreenProps = {}): React.ReactElement {
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
  const executeTransaction = useSendStore((state) => state.executeTransaction);
  const getNFTQuantity = useSendStore((state) => state.getNFTQuantity);
  const selectedCollection = useSendStore((state) => state.selectedCollection);
  const setNFTQuantity = useSendStore((state) => state.setNFTQuantity);

  // Get the first selected NFT (should only be one for single NFT flow)
  const selectedNFT = selectedNFTs?.[0] || null;

  // For ERC1155, get the quantity from the store
  const getInitialQuantity = () => {
    if (selectedNFT && selectedNFT.contractType === 'ERC1155') {
      const nftId = selectedNFT.id || '';
      return getNFTQuantity(nftId);
    }
    return 1;
  };

  const [selectedQuantity, setSelectedQuantity] = useState(getInitialQuantity);

  // Check if NFT is ERC1155
  const isERC1155 = selectedNFT?.contractType === 'ERC1155';
  const maxQuantity =
    typeof selectedNFT?.amount === 'number'
      ? selectedNFT.amount
      : parseInt(selectedNFT?.amount as string) || 1;

  // Debug the title - Swapped: ERC1155 shows "Send S/NFTs", regular shows "Send NFTs"
  const sectionTitle = isERC1155 ? t('send.sendSNFTs') : t('send.sendNFTs');

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
    contractType: selectedNFT?.contractType, // Pass for ERC1155 detection
    amount: maxQuantity, // Pass total amount for display
  };

  // Query for complete account information including storage and balance
  const { data: accountInfo } = useQuery({
    queryKey: storageQueryKeys.accountInfo(fromAccount || null),
    queryFn: () => storageQueries.fetchAccountInfo(fromAccount || null),
    enabled: !!fromAccount?.address,
    staleTime: 0, // Always fresh for financial data
  });

  // Query for resource compatibility check (NFT only)
  const { data: isResourceCompatible = true } = useQuery({
    queryKey: storageQueryKeys.resourceCheck(
      toAccount?.address || '',
      selectedNFT?.flowIdentifier || ''
    ),
    queryFn: () =>
      storageQueries.checkResourceCompatibility(
        toAccount?.address || '',
        selectedNFT?.flowIdentifier || ''
      ),
    enabled: !!(toAccount?.address && selectedNFT?.flowIdentifier),
    staleTime: 0, // 5 minutes cache for resource compatibility
  });

  // Calculate account incompatibility (invert the compatibility result)
  const isAccountIncompatible = !isResourceCompatible;

  // Mock transaction fee data - TODO: Replace with real fee calculation
  const transactionFee = '0.001 FLOW';
  const usdFee = '$0.02';
  const isFeesFree = false;

  // Calculate storage warning state based on account validation for NFT transfer
  const validationResult = useMemo(() => {
    if (!accountInfo) {
      return { canProceed: true, showWarning: false, warningType: null };
    }
    // NFT transfers are treated as "other" transactions (non-FLOW)
    return storageUtils.validateOtherTransaction(accountInfo, isFeesFree);
  }, [accountInfo, isFeesFree]);

  const showStorageWarning = validationResult.showWarning;
  const storageWarningMessage = useMemo(() => {
    return t(storageUtils.getStorageWarningMessageKey(validationResult.warningType));
  }, [validationResult.warningType, accountInfo, t]);

  // Calculate if send button should be disabled
  const isSendDisabled =
    !selectedNFT ||
    !fromAccount ||
    !toAccount ||
    isLoading ||
    !validationResult.canProceed ||
    isAccountIncompatible;

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
      const result = await executeTransaction();

      // Close the React Native view after successful transaction
      const platform = bridge.getPlatform();
      if (result && (platform === Platform.iOS || platform === Platform.Android)) {
        bridge.closeRN();
      }

      // Invalidate NFT caches after successful transaction
      const tokenStore = useTokenQueryStore.getState();
      if (selectedCollection && fromAccount) {
        const network = bridge.getNetwork();
        const currentAddress = fromAccount.address;

        tokenStore.invalidateNFTCollection(currentAddress, selectedCollection, network);
      }

      // Navigation after successful transaction will be handled by the store
    } catch (error) {
      logger.error('[SendSingleNFTScreen] Transaction failed:', error);
      // Error handling will be managed by the store
    }
  }, [executeTransaction, selectedCollection, fromAccount]);

  // Early return if essential data is missing
  if (!selectedNFT) {
    return (
      <BackgroundWrapper backgroundColor="$bgDrawer">
        <YStack flex={1} items="center" justify="center" px="$6">
          <Text fontSize="$6" fontWeight="600" color="$color" mb="$3" text="center">
            {t('nft.notFound.title')}
          </Text>
          <Text fontSize="$4" color="$textSecondary" text="center">
            {t('send.noNFTSelected')}
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
          <YStack gap="$3">
            {/* NFT Section */}
            <YStack px={16} bg="rgba(255, 255, 255, 0.1)" rounded="$4" p="$3" gap="$1">
              {/* From Account Section */}
              {fromAccount && (
                <View mb={-18}>
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
                title={sectionTitle}
                onEditPress={handleEditNFTPress}
                showEditButton={true}
                editButtonText={t('send.change')}
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
                      if (selectedNFT?.id) {
                        setNFTQuantity(selectedNFT.id, newQuantity);
                      }
                    }}
                    disabled={false}
                  />
                </YStack>
              )}
            </YStack>

            {/* Arrow Down Indicator */}
            <XStack position="relative" height={0}>
              <XStack width="100%" position="absolute" t={-30} justify="center">
                <SendArrowDivider variant="arrow" size={48} />
              </XStack>
            </XStack>

            {/* To Account Section */}
            {toAccount && (
              <YStack mt={'$1'}>
                <ToAccountSection
                  account={toAccount}
                  title={t('send.toAccount')}
                  isAccountIncompatible={isAccountIncompatible}
                  onEditPress={handleEditAccountPress}
                  showEditButton={true}
                  isLinked={toAccount.type === 'child' || !!toAccount.parentAddress}
                  incompatibleAccountText={t('account.compatibility.incompatible')}
                  learnMoreText={t('account.compatibility.learnMore')}
                  unknownAccountText={t('account.compatibility.unknown')}
                  dialogTitle={t('account.compatibility.dialog.title')}
                  dialogButtonText={t('account.compatibility.dialog.button')}
                  dialogDescriptionMain={t('account.compatibility.dialog.descriptionMain')}
                  dialogDescriptionSecondary={t(
                    'account.compatibility.dialog.descriptionSecondary'
                  )}
                />
              </YStack>
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
                  title={t('storage.warning.title')}
                  visible={true}
                />
              )}
            </YStack>
          </YStack>
        </ScrollView>

        {/* Send Button - Anchored to bottom */}
        <YStack p={20} pt="$2" mb={'$10'}>
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
          sendStaticImage={assets?.sendStaticImage}
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
                    contractType: selectedNFT.contractType,
                    amount: maxQuantity,
                    selectedQuantity: isERC1155 ? selectedQuantity : undefined,
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
          summaryText={t('send.summary')}
          sendNFTsText={t('send.sendNFTs')}
          sendingText={t('send.sending')}
          confirmSendText={t('send.confirmSend')}
          holdToSendText={t('send.holdToSend')}
        />
      </YStack>
    </BackgroundWrapper>
  );
}
