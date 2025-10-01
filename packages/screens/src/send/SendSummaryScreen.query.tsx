import { bridge, navigation } from '@onflow/frw-context';
import {
  useSendStore,
  sendSelectors,
  storageQueryKeys,
  storageQueries,
  storageUtils,
  useTokenQueryStore,
} from '@onflow/frw-stores';
import { Platform, type NFTModel, type NFTTransactionDisplayData, type SendFormData } from '@onflow/frw-types';
import {
  BackgroundWrapper,
  YStack,
  ScrollView,
  View,
  NFTSendPreview,
  MultipleNFTsPreview,
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
  XStack,
  ERC1155QuantitySelector,
  useTheme,
} from '@onflow/frw-ui';
import {
  logger,
  getNFTCover,
  getNFTId,
  transformAccountForCard,
  transformAccountForDisplay,
  isDarkMode,
} from '@onflow/frw-utils';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { ScreenAssets } from '../assets/images';

interface SendSummaryScreenProps {
  assets?: ScreenAssets;
}

/**
 * Unified Send Summary Screen that handles both single and multiple NFT transfers
 * Automatically detects the transfer type based on selected NFTs
 */
export function SendSummaryScreen({ assets }: SendSummaryScreenProps = {}): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = bridge.getPlatform() === 'extension';
  //const toast = useToast();

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
  const getNFTQuantity = useSendStore((state) => state.getNFTQuantity);
  const selectedCollection = useSendStore((state) => state.selectedCollection);
  const setNFTQuantity = useSendStore((state) => state.setNFTQuantity);

  // Determine transfer type based on selected NFTs
  const isMultipleNFTs = selectedNFTs && selectedNFTs.length > 1;
  const isSingleNFT = selectedNFTs && selectedNFTs.length === 1;
  const selectedNFT = selectedNFTs?.[0] || null;

  // For ERC1155 single NFT, get the quantity from the store
  const getInitialQuantity = () => {
    if (selectedNFT && selectedNFT.contractType === 'ERC1155') {
      const nftId = selectedNFT.id || '';
      return getNFTQuantity(nftId);
    }
    return 1;
  };

  const [selectedQuantity, setSelectedQuantity] = useState(getInitialQuantity);

  // Check if NFT is ERC1155 (only for single NFT)
  const isERC1155 = selectedNFT?.contractType === 'ERC1155';
  const maxQuantity =
    typeof selectedNFT?.amount === 'number'
      ? selectedNFT.amount
      : parseInt(selectedNFT?.amount as string) || 1;

  // Theme-aware styling - same as SendTokensScreen
  const theme = useTheme();
  const isCurrentlyDarkMode = isDarkMode(theme);
  const cardBackgroundColor = isDarkMode(theme) ? '$light10' : '$bg2';
  const separatorColor = isDarkMode(theme) ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const sendButtonBackgroundColor = isCurrentlyDarkMode
    ? theme.white?.val || '#FFFFFF'
    : theme.black?.val || '#000000';
  const sendButtonTextColor = isCurrentlyDarkMode
    ? theme.black?.val || '#000000'
    : theme.white?.val || '#FFFFFF';
  const disabledButtonTextColor = theme.color?.val || (isCurrentlyDarkMode ? '#999999' : '#FFFFFF');

  // Dynamic section title based on transfer type
  const sectionTitle = useMemo(() => {
    if (isMultipleNFTs) {
      return t('send.sendNFTs');
    } else if (isERC1155) {
      return t('send.sendSNFTs');
    } else {
      return t('send.sendNFTs');
    }
  }, [isMultipleNFTs, isERC1155, t]);

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
        setIsFreeGasEnabled(true);
      }
    };

    checkFreeGasStatus();
  }, []);

  // Transform NFT data for UI
  const nftForUI: NFTTransactionDisplayData = useMemo(
    () =>
      ({
        ...selectedNFT,
        id: selectedNFT?.id || '',
        name: selectedNFT?.name || t('nft.untitled'),
        thumbnail: selectedNFT ? getNFTCover(selectedNFT) : '',
        collection: selectedNFT?.collectionName || t('nft.unknownCollection'),
        collectionContractName: selectedNFT?.collectionContractName,
        description: selectedNFT?.description || '',
        type: selectedNFT?.type || 'flow',
        contractType: selectedNFT?.contractType,
        amount: maxQuantity.toString(),
      }) as NFTTransactionDisplayData,
    [selectedNFT, maxQuantity]
  );

  const nftsForUI: NFTTransactionDisplayData[] = useMemo(
    () =>
      selectedNFTs?.map(
        (nft) =>
          ({
            ...nft,
            id: nft.id || '',
            name: nft.name || t('nft.untitled'),
            thumbnail: getNFTCover(nft),
            collection: nft.collectionName || t('nft.unknownCollection'),
            collectionContractName: nft.collectionContractName,
            description: nft.description || '',
            type: nft.type || 'flow',
          }) as NFTTransactionDisplayData
      ) || [],
    [selectedNFTs]
  );

  // Query for complete account information
  const { data: accountInfo } = useQuery({
    queryKey: storageQueryKeys.accountInfo(fromAccount || null),
    queryFn: () => storageQueries.fetchAccountInfo(fromAccount || null),
    enabled: !!fromAccount?.address,
    staleTime: 0,
  });

  // Query for resource compatibility check
  const firstNFTFlowIdentifier = selectedNFTs?.[0]?.flowIdentifier;
  const { data: isResourceCompatible = true } = useQuery({
    queryKey: storageQueryKeys.resourceCheck(
      toAccount?.address || '',
      firstNFTFlowIdentifier || ''
    ),
    queryFn: () =>
      storageQueries.checkResourceCompatibility(
        toAccount?.address || '',
        firstNFTFlowIdentifier || ''
      ),
    enabled: !!(toAccount?.address && firstNFTFlowIdentifier),
    staleTime: 5 * 60 * 1000,
  });

  const isAccountIncompatible = !isResourceCompatible;

  // Mock transaction fee data
  const transactionFee = '0.001 FLOW';
  const usdFee = '$0.02';
  const isFeesFree = false;

  // Calculate storage warning state
  const validationResult = useMemo(() => {
    if (!accountInfo) {
      return { canProceed: true, showWarning: false, warningType: null };
    }
    return storageUtils.validateOtherTransaction(accountInfo, isFeesFree);
  }, [accountInfo, isFeesFree]);

  const showStorageWarning = validationResult.showWarning;
  const storageWarningMessage = useMemo(() => {
    return t(storageUtils.getStorageWarningMessageKey(validationResult.warningType));
  }, [validationResult.warningType, accountInfo, t]);

  // Calculate if send button should be disabled
  const isSendDisabled =
    !selectedNFTs ||
    selectedNFTs.length === 0 ||
    !fromAccount ||
    !toAccount ||
    isLoading ||
    !validationResult.canProceed ||
    isAccountIncompatible;

  // Create form data for transaction confirmation
  const formData: SendFormData = {
    tokenAmount: isMultipleNFTs
      ? selectedNFTs.length.toString()
      : isERC1155
        ? selectedQuantity.toString()
        : '1',
    fiatAmount: '0.00',
    isTokenMode: true,
    transactionFee,
  };

  // Event handlers
  const handleEditNFTPress = useCallback(() => {
    // Get current NFT data from store
    const currentSelectedNFTs = useSendStore.getState().selectedNFTs;
    const currentSelectedNFT = currentSelectedNFTs?.[0] || null;

    if (currentSelectedNFT && fromAccount) {
      // Instead of creating a new collection, find the existing one from the token store
      // This ensures we have all the required properties including the path
      const tokenStore = useTokenQueryStore.getState();

      // For EVM NFTs, we might need to check both Flow and EVM addresses
      const addressesToCheck = [fromAccount.address];
      if (fromAccount.evmAddress) {
        addressesToCheck.push(fromAccount.evmAddress);
      }

      let matchingCollection = null;

      // Try each address until we find the collection
      for (const address of addressesToCheck) {
        const existingCollections = tokenStore.getNFTCollectionsForAddress(address);

        if (existingCollections) {
          // Find the collection that matches this NFT
          matchingCollection = existingCollections.find((collection) => {
            // Try multiple matching strategies
            return (
              collection.name === currentSelectedNFT.collectionName ||
              collection.contractName === currentSelectedNFT.collectionContractName ||
              collection.id === currentSelectedNFT.collectionContractName ||
              collection.flowIdentifier === currentSelectedNFT.flowIdentifier ||
              collection.evmAddress === currentSelectedNFT.evmAddress
            );
          });

          if (matchingCollection) {
            break; // Found it, stop searching
          }
        }
      }

      if (matchingCollection) {
        const setSelectedCollection = useSendStore.getState().setSelectedCollection;
        setSelectedCollection(matchingCollection);
      }
    }

    navigation.navigate('NFTList');
  }, [fromAccount]);

  const handleEditAccountPress = useCallback(() => {
    navigation.navigate('SendTo');
  }, []);

  const handleRemoveNFT = useCallback(
    (nftId: string) => {
      if (!selectedNFTs) return;
      const updatedNFTs = selectedNFTs.filter((nft) => getNFTId(nft) !== nftId);
      setSelectedNFTs(updatedNFTs);

      if (updatedNFTs.length === 0) {
        navigation.navigate('NFTList');
      }
    },
    [selectedNFTs, setSelectedNFTs]
  );

  const handleSendPress = useCallback(() => {
    if (isERC1155) {
      logger.info('[SendSummaryScreen] Sending ERC1155 NFT with quantity:', {
        quantity: selectedQuantity,
        maxQuantity,
        nftId: selectedNFT?.id,
      });
    } else if (isMultipleNFTs) {
      logger.info('[SendSummaryScreen] Sending multiple NFTs:', {
        count: selectedNFTs.length,
      });
    } else {
      logger.info('[SendSummaryScreen] Sending single NFT');
    }
    setIsConfirmationVisible(true);
  }, [isERC1155, selectedQuantity, maxQuantity, selectedNFT, isMultipleNFTs, selectedNFTs]);

  const handleConfirmationClose = useCallback(() => {
    setIsConfirmationVisible(false);
  }, []);

  const handleTransactionConfirm = useCallback(async () => {
    try {
      const result = await executeTransaction();

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
    } catch (error) {
      logger.error('[SendSummaryScreen] Transaction failed:', error);
    }
  }, [executeTransaction, selectedCollection, fromAccount]);

  // Early return if essential data is missing
  if (!selectedNFTs || selectedNFTs.length === 0) {
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
            <YStack px={16} bg={cardBackgroundColor} rounded="$4" p="$3" gap="$1">
              {/* From Account Section */}
              {fromAccount && (
                <View mb={-18}>
                  <AccountCard
                    account={transformAccountForCard(fromAccount)}
                    title={t('send.fromAccount')}
                    isLoading={false}
                  />
                </View>
              )}

              <Separator mx="$0" my="$0" mb="$2" borderColor={separatorColor} borderWidth={0.5} />

              <SendSectionHeader
                title={sectionTitle}
                onEditPress={handleEditNFTPress}
                showEditButton={true}
                editButtonText={t('send.change')}
              />

              {/* NFT Preview - Conditional rendering based on transfer type */}
              <View mt={-8} mb={-8}>
                {isMultipleNFTs ? (
                  <MultipleNFTsPreview
                    nfts={nftsForUI}
                    onRemoveNFT={handleRemoveNFT}
                    maxVisibleThumbnails={3}
                    expandable={true}
                    thumbnailSize={90}
                    backgroundColor="transparent"
                    borderRadius={14.4}
                    contentPadding="$0"
                    unnamedNFTText={t('nft.untitled')}
                    unknownCollectionText={t('nft.unknownCollection')}
                    noNFTsSelectedText={t('nft.noNFTsSelected')}
                  />
                ) : (
                  <NFTSendPreview
                    nft={nftForUI}
                    onEditPress={handleEditNFTPress}
                    showEditButton={false}
                    sectionTitle=""
                    backgroundColor="transparent"
                    borderRadius={0}
                    contentPadding="$0"
                    imageSize={76}
                  />
                )}
              </View>

              {/* ERC1155 Quantity Selector - Only for single ERC1155 NFTs */}
              {isSingleNFT && isERC1155 && (
                <YStack gap="$2" mb="$3">
                  <ERC1155QuantitySelector
                    quantity={selectedQuantity}
                    maxQuantity={maxQuantity}
                    onQuantityChange={(newQuantity) => {
                      logger.info('[SendSummaryScreen] ERC1155 quantity changed:', {
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
              <XStack width="100%" position="absolute" t={-30} justify="center" z={10}>
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
        <YStack pt="$4" mb={'$10'}>
          <YStack
            width="100%"
            height={52}
            bg={isSendDisabled ? '#6b7280' : (sendButtonBackgroundColor as any)}
            rounded={16}
            items="center"
            justify="center"
            borderWidth={1}
            borderColor={isSendDisabled ? '#6b7280' : (sendButtonBackgroundColor as any)}
            opacity={isSendDisabled ? 0.7 : 1}
            pressStyle={{ opacity: 0.9 }}
            onPress={isSendDisabled ? undefined : handleSendPress}
            cursor={isSendDisabled ? 'not-allowed' : 'pointer'}
          >
            <Text
              fontSize="$4"
              fontWeight="600"
              color={isSendDisabled ? disabledButtonTextColor : (sendButtonTextColor as any)}
            >
              {t('common.next')}
            </Text>
          </YStack>
        </YStack>

        {/* Transaction Confirmation - Dynamic transaction type */}
        <ConfirmationDrawer
          visible={isConfirmationVisible}
          transactionType={isMultipleNFTs ? 'multiple-nfts' : 'single-nft'}
          selectedToken={null}
          sendStaticImage={assets?.sendStaticImage}
          selectedNFTs={
            isMultipleNFTs
              ? nftsForUI
              : selectedNFT
                ? [
                    {
                      id: selectedNFT.id || '',
                      name: selectedNFT.name || t('nft.untitled'),
                      thumbnail: selectedNFT.thumbnail || '',
                      collection: selectedNFT.collectionName || t('nft.unknownCollection'),
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
          unknownAccountText={t('send.unknownAccount')}
        />
      </YStack>
    </BackgroundWrapper>
  );
}
