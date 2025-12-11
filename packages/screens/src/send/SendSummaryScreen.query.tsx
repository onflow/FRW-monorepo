import { bridge, navigation } from '@onflow/frw-context';
import {
  useSendStore,
  sendSelectors,
  storageQueryKeys,
  storageQueries,
  storageUtils,
  useTokenQueryStore,
  payerStatusQueryKeys,
  payerStatusQueries,
} from '@onflow/frw-stores';
import {
  Platform,
  type NFTTransactionDisplayData,
  type SendFormData,
  ScreenName,
} from '@onflow/frw-types';
import {
  BackgroundWrapper,
  YStack,
  View,
  NFTSendPreview,
  MultipleNFTsPreview,
  SendArrowDivider,
  ConfirmationDrawer,
  TransactionFeeSection,
  SurgeFeeConfirmationSection,
  SurgeModal,
  ToAccountSection,
  AccountCard,
  SendSectionHeader,
  StorageWarning,
  Text,
  ExtensionHeader,
  Separator,
  XStack,
  ERC1155QuantitySelector,
} from '@onflow/frw-ui';
import {
  logger,
  getNFTCover,
  getNFTId,
  transformAccountForCard,
  transformAccountForDisplay,
  retryConfigs,
  showError,
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
  const network = bridge.getNetwork() || 'mainnet';

  // Local state for confirmation modal
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [isFreeGasEnabled, setIsFreeGasEnabled] = useState(true);
  const [isSurgeWarningVisible, setIsSurgeWarningVisible] = useState(false);

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

  // Theme-aware styling
  const cardBackgroundColor = '$bg1';
  const separatorColor = '$border1';

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
  // Only fetch for main accounts as child accounts don't need storage validation
  const { data: accountInfo } = useQuery({
    queryKey: storageQueryKeys.accountInfo(fromAccount || null),
    queryFn: () => storageQueries.fetchAccountInfo(fromAccount || null),
    enabled: !!fromAccount?.address && fromAccount?.type === 'main',
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

  const {
    data: payerStatus = null,
    isLoading: isLoadingPayerStatus,
    error: payerStatusError,
  } = useQuery({
    queryKey: payerStatusQueryKeys.payerStatus(network as 'mainnet' | 'testnet'),
    queryFn: () => payerStatusQueries.fetchPayerStatus(network as 'mainnet' | 'testnet'),
    staleTime: 0,
    enabled: true,
    retry: retryConfigs.critical.retry,
    retryDelay: retryConfigs.critical.retryDelay,
  });

  const isSurgePricingActive = Boolean(payerStatus?.surge?.active);
  const surgeMultiplier = payerStatus?.surge?.multiplier || 1;

  const formattedSurgeMultiplier = useMemo(() => {
    const multiplier = Number(surgeMultiplier || 1);
    if (Number.isNaN(multiplier)) {
      return '1';
    }
    return multiplier.toFixed(2).replace(/\.?0+$/, '');
  }, [surgeMultiplier]);

  // Calculate transaction fee from API's maxFee field or fallback to default
  // Calculate transaction fee from API's maxFee or use default
  const transactionFee = useMemo(() => {
    const fee = payerStatus?.surge?.maxFee;
    if (!fee) return '~0.001 FLOW';

    const precision = fee < 0.01 ? 4 : fee < 0.1 ? 3 : 2;
    return `~${fee.toFixed(precision)} FLOW`;
  }, [payerStatus?.surge?.maxFee]);

  const usdFee = '$0.02';
  const isFeesFree = false;

  // Calculate storage warning state
  // Only validate for main accounts as child accounts don't have storage limitations
  const validationResult = useMemo(() => {
    // Skip validation for non-main accounts (child accounts don't need storage validation)
    if (!fromAccount || fromAccount.type !== 'main' || !accountInfo) {
      return { canProceed: true, showWarning: false, warningType: null };
    }
    return storageUtils.validateOtherTransaction(accountInfo, isFeesFree);
  }, [fromAccount, accountInfo, isFeesFree]);

  const showStorageWarning = validationResult.showWarning;
  const storageWarningMessage = useMemo(() => {
    return t(storageUtils.getStorageWarningMessageKey(validationResult.warningType));
  }, [validationResult.warningType, t]);

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

    logger.debug('[SendSummaryScreen] Edit NFT pressed:', {
      currentSelectedNFT: currentSelectedNFT
        ? {
            id: currentSelectedNFT.id,
            collectionName: currentSelectedNFT.collectionName,
            collectionContractName: currentSelectedNFT.collectionContractName,
            flowIdentifier: currentSelectedNFT.flowIdentifier,
            evmAddress: currentSelectedNFT.evmAddress,
            address: currentSelectedNFT.address,
          }
        : null,
      fromAccount: fromAccount?.address,
    });

    if (currentSelectedNFT && fromAccount) {
      // Instead of creating a new collection, find the existing one from the token store
      // This ensures we have all the required properties including the path
      const tokenStore = useTokenQueryStore.getState();

      // For EVM NFTs, we might need to check both Flow and EVM addresses
      const addressesToCheck = [fromAccount.address];
      if ((fromAccount as any).evmAddress) {
        addressesToCheck.push((fromAccount as any).evmAddress);
      }

      let matchingCollection = null;

      // Try each address until we find the collection
      for (const address of addressesToCheck) {
        const existingCollections = tokenStore.getNFTCollectionsForAddress(address);

        logger.debug('[SendSummaryScreen] Searching for collection:', {
          address,
          collectionsFound: existingCollections?.length || 0,
        });

        if (existingCollections) {
          // Find the collection that matches this NFT
          matchingCollection = existingCollections.find((collection) => {
            let matches = false;

            // Flow collection use flowIdentifier
            if (collection.type === 'flow') {
              matches = collection.flowIdentifier === currentSelectedNFT.flowIdentifier;
            }
            // EVM collection use evmAddress
            else if (collection.type === 'evm') {
              matches = collection.evmAddress === currentSelectedNFT.evmAddress;
            }

            if (matches) {
              logger.debug('[SendSummaryScreen] Found matching collection:', {
                collectionName: collection.name,
                collectionId: collection.id,
                collectionType: collection.type,
              });
            }

            return matches;
          });

          if (matchingCollection) {
            break; // Found it, stop searching
          }
        }
      }

      if (matchingCollection) {
        const setSelectedCollection = useSendStore.getState().setSelectedCollection;
        setSelectedCollection(matchingCollection);
      } else {
        // Fallback: Create a minimal collection object if not found
        logger.warn('[SendSummaryScreen] No matching collection found, creating fallback');
        const fallbackCollection = {
          id: currentSelectedNFT.collectionContractName || currentSelectedNFT.contractName || '',
          name: currentSelectedNFT.collectionName || 'Unknown Collection',
          contractName:
            currentSelectedNFT.collectionContractName || currentSelectedNFT.contractName || '',
          address: currentSelectedNFT.contractAddress || currentSelectedNFT.address || '',
          evmAddress: currentSelectedNFT.evmAddress,
          flowIdentifier: currentSelectedNFT.flowIdentifier,
          path: null,
          nfts: [],
        };
        const setSelectedCollection = useSendStore.getState().setSelectedCollection;
        setSelectedCollection(fallbackCollection as any);
      }
    }

    navigation.navigate(ScreenName.NFT_LIST);
  }, [fromAccount]);

  const handleEditAccountPress = useCallback(() => {
    navigation.navigate(ScreenName.SEND_TO);
  }, []);

  const handleRemoveNFT = useCallback(
    (nftId: string) => {
      if (!selectedNFTs) return;
      const updatedNFTs = selectedNFTs.filter((nft) => getNFTId(nft) !== nftId);
      setSelectedNFTs(updatedNFTs);

      if (updatedNFTs.length === 0) {
        navigation.navigate(ScreenName.NFT_LIST);
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
    if (isSurgePricingActive) {
      setIsSurgeWarningVisible(true);
      return;
    }

    setIsConfirmationVisible(true);
  }, [
    isERC1155,
    selectedQuantity,
    maxQuantity,
    selectedNFT,
    isMultipleNFTs,
    selectedNFTs,
    isSurgePricingActive,
  ]);

  const handleSurgeModalClose = useCallback(() => {
    setIsSurgeWarningVisible(false);
  }, []);

  const handleSurgeModalAgree = useCallback(() => {
    setIsSurgeWarningVisible(false);
    setIsConfirmationVisible(true);
  }, []);

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
    } catch (error: any) {
      logger.error('[SendSummaryScreen] Transaction failed:', error);
      showError(error, bridge, t('send.failed'));
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

        <YStack flex={1}>
          {/* Scrollable Content */}
          <YStack flex={1} gap="$3">
            <YStack gap="$1" bg={cardBackgroundColor} rounded="$4" p="$4">
              {/* From Account Section */}
              {fromAccount && (
                <AccountCard
                  isSendTokensScreen={!isExtension}
                  account={transformAccountForCard(fromAccount)}
                  title={t('send.fromAccount')}
                  isLoading={false}
                />
              )}

              <Separator mx="$0" mt="$4" mb="$2" borderColor={separatorColor} borderWidth={0.5} />

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
              {!isSurgePricingActive ? (
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
              ) : (
                <SurgeFeeConfirmationSection
                  transactionFee={transactionFee}
                  surgeMultiplier={surgeMultiplier}
                  transactionFeeLabel={t('surge.modal.transactionFee')}
                  surgeTitle={t('surge.modal.surgeActive')}
                  description={t('surge.modal.description', {
                    multiplier: formattedSurgeMultiplier,
                  })}
                />
              )}

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
        </YStack>

        {/* Send Button - Anchored to bottom */}
        <YStack pt="$4" mb={'$10'}>
          <YStack
            width="100%"
            height={52}
            bg={isSendDisabled ? '#6b7280' : isSurgePricingActive ? '$warning' : '$text'}
            rounded={16}
            items="center"
            justify="center"
            borderWidth={1}
            borderColor={isSendDisabled ? '$textMuted' : '$text'}
            opacity={isSendDisabled ? 0.7 : 1}
            pressStyle={{ opacity: 0.9 }}
            onPress={isSendDisabled ? undefined : handleSendPress}
            cursor={isSendDisabled ? 'not-allowed' : 'pointer'}
          >
            <Text data-testid="next" fontSize="$4" fontWeight="600" color="$bg">
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
          sendSNFTsText={t('send.sendSNFTs')}
          sendingText={t('send.sending')}
          confirmSendText={t('send.confirmSend')}
          holdToSendText={t('send.holdToSend')}
          unknownAccountText={t('send.unknownAccount')}
        />

        <SurgeModal
          visible={isSurgeWarningVisible}
          transactionFee={transactionFee}
          multiplier={formattedSurgeMultiplier}
          title={t('surge.modal.title')}
          transactionFeeLabel={t('surge.modal.transactionFee')}
          surgeActiveText={t('surge.modal.surgeActive')}
          description={t('surge.modal.description', { multiplier: formattedSurgeMultiplier })}
          holdToAgreeText={t('surge.modal.holdToAgree')}
          onClose={handleSurgeModalClose}
          onAgree={handleSurgeModalAgree}
          isLoading={isLoading}
        />
      </YStack>
    </BackgroundWrapper>
  );
}
