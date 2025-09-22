import { bridge, navigation } from '@onflow/frw-context';
import {
  useSendStore,
  sendSelectors,
  storageQueryKeys,
  storageQueries,
  storageUtils,
} from '@onflow/frw-stores';
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
  type NFTSendData,
  type TransactionFormData,
  XStack,
  ERC1155QuantitySelector,
} from '@onflow/frw-ui';
import {
  logger,
  getNFTCover,
  getNFTId,
  transformAccountForCard,
  transformAccountForDisplay,
} from '@onflow/frw-utils';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Unified NFT Send Screen that handles both single and multiple NFT transfers
 * Uses TanStack Query for data fetching and caching
 */
export function SendNFTScreen(): React.ReactElement {
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
  const getNFTQuantity = useSendStore((state) => state.getNFTQuantity);
  const selectedCollection = useSendStore((state) => state.selectedCollection);
  const setNFTQuantity = useSendStore((state) => state.setNFTQuantity);

  // Determine if this is single or multiple NFT transfer
  const isMultipleNFTs = (selectedNFTs?.length || 0) > 1;
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

  // Check if NFT is ERC1155 (only relevant for single NFT)
  const isERC1155 = !isMultipleNFTs && selectedNFT?.contractType === 'ERC1155';
  const maxQuantity =
    typeof selectedNFT?.amount === 'number'
      ? selectedNFT.amount
      : parseInt(selectedNFT?.amount as string) || 1;

  // Section title based on NFT type and count
  const sectionTitle = useMemo(() => {
    if (isMultipleNFTs) {
      return 'Send NFTs';
    }
    return isERC1155 ? 'Send S/NFTs' : 'Send NFTs';
  }, [isMultipleNFTs, isERC1155]);

  // Log NFT detection
  useEffect(() => {
    if (selectedNFT) {
      if (isERC1155) {
        logger.info('[SendNFTScreen] ERC1155 NFT detected:', {
          nftId: selectedNFT.id,
          nftName: selectedNFT.name,
          contractType: selectedNFT.contractType,
          availableAmount: selectedNFT.amount,
          maxQuantity,
        });
      } else {
        logger.info('[SendNFTScreen] Standard NFT detected:', {
          nftId: selectedNFT.id,
          nftName: selectedNFT.name,
          contractType: selectedNFT.contractType || 'ERC721',
          isMultiple: isMultipleNFTs,
        });
      }
    }
  }, [selectedNFT, isERC1155, maxQuantity, isMultipleNFTs]);

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
  const nftsForUI: NFTSendData[] = useMemo(
    () =>
      selectedNFTs?.map((nft) => {
        const image = getNFTCover(nft);
        return {
          id: nft.id || '',
          name: nft.name || 'Untitled',
          image: image,
          collection: nft.collectionName || 'Unknown Collection',
          collectionContractName: nft.collectionContractName,
          description: nft.description || '',
          type: nft.type,
          contractType: nft.contractType,
          amount: typeof nft.amount === 'number' ? nft.amount : parseInt(nft.amount as string) || 1,
        };
      }) || [],
    [selectedNFTs]
  );

  // Single NFT data for single NFT preview
  const nftForUI: NFTSendData = nftsForUI[0] || {
    id: '',
    name: 'Untitled',
    image: '',
    collection: 'Unknown Collection',
    description: '',
  };

  // Query for complete account information including storage and balance
  const { data: accountInfo } = useQuery({
    queryKey: storageQueryKeys.accountInfo(fromAccount || null),
    queryFn: () => storageQueries.fetchAccountInfo(fromAccount || null),
    enabled: !!fromAccount?.address,
    staleTime: 0, // Always fresh for financial data
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
    staleTime: 5 * 60 * 1000, // 5 minutes cache for resource compatibility
  });

  // Calculate account incompatibility (invert the compatibility result)
  const isAccountIncompatible = !isResourceCompatible;

  // Mock transaction fee data - TODO: Replace with real fee calculation
  const transactionFee = '0.001';
  const usdFee = '0.00';
  const isFeesFree = true; // Following Figma design "Covered by Flow Wallet"

  // Calculate storage warning state based on account validation
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
    !selectedNFTs ||
    selectedNFTs.length === 0 ||
    !fromAccount ||
    !toAccount ||
    isLoading ||
    !validationResult.canProceed ||
    isAccountIncompatible;

  // Create form data for transaction confirmation
  const formData: TransactionFormData = {
    tokenAmount: isERC1155 ? selectedQuantity.toString() : selectedNFTs?.length.toString() || '0',
    fiatAmount: '0.00',
    isTokenMode: true,
    transactionFee,
  };

  // Event handlers
  const handleEditNFTsPress = useCallback(() => {
    navigation.navigate('NFTList');
  }, []);

  const handleEditAccountPress = useCallback(() => {
    navigation.navigate('SendTo');
  }, []);

  const handleRemoveNFT = useCallback(
    (nftId: string) => {
      if (!selectedNFTs) return;
      const updatedNFTs = selectedNFTs.filter((nft) => getNFTId(nft) !== nftId);
      setSelectedNFTs(updatedNFTs);

      // If no NFTs remain, navigate back to the NFT selection screen
      if (updatedNFTs.length === 0) {
        navigation.navigate('NFTList');
      }
    },
    [selectedNFTs, setSelectedNFTs]
  );

  const handleSendPress = useCallback(() => {
    if (isERC1155) {
      logger.info('[SendNFTScreen] Sending ERC1155 NFT with quantity:', {
        quantity: selectedQuantity,
        maxQuantity,
        nftId: selectedNFT?.id,
      });
    } else {
      logger.info('[SendNFTScreen] Sending NFT(s):', {
        count: selectedNFTs?.length,
        isMultiple: isMultipleNFTs,
      });
    }
    setIsConfirmationVisible(true);
  }, [isERC1155, selectedQuantity, maxQuantity, selectedNFT, selectedNFTs, isMultipleNFTs]);

  const handleConfirmationClose = useCallback(() => {
    setIsConfirmationVisible(false);
  }, []);

  const handleTransactionConfirm = useCallback(async () => {
    try {
      if (!isExtension) {
        setIsConfirmationVisible(false);
      }
      await executeTransaction();

      // Invalidate NFT caches after successful transaction
      const tokenStore = useTokenQueryStore.getState();
      if (selectedCollection && fromAccount) {
        const network = bridge.getNetwork();
        const currentAddress = fromAccount.address;
        tokenStore.invalidateNFTCollection(currentAddress, selectedCollection, network);
      }
    } catch (error) {
      logger.error('[SendNFTScreen] Transaction failed:', error);
    }
  }, [executeTransaction, isExtension, selectedCollection, fromAccount]);

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
          <YStack gap={isMultipleNFTs ? '$4' : '$3'}>
            {/* NFT Section */}
            <YStack px={16} bg="rgba(255, 255, 255, 0.1)" rounded="$4" p="$3" gap="$2">
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

              <Separator mx="$0" my="$0" borderColor="rgba(255, 255, 255, 0.1)" borderWidth={0.5} />

              <SendSectionHeader
                title={sectionTitle}
                onEditPress={handleEditNFTsPress}
                showEditButton={true}
                editButtonText="Change"
              />

              {/* NFT Preview - Different components based on count */}
              {isMultipleNFTs ? (
                <View mt={-8} mb={-8} pb="$7">
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
              ) : (
                <View mt={-8} mb={-8}>
                  <NFTSendPreview
                    nft={nftForUI}
                    onEditPress={handleEditNFTsPress}
                    showEditButton={false}
                    sectionTitle=""
                    backgroundColor="transparent"
                    borderRadius={0}
                    contentPadding="$0"
                    imageSize="$24"
                  />
                </View>
              )}

              {/* ERC1155 Quantity Selector - Only for single ERC1155 NFTs */}
              {isERC1155 && (
                <YStack gap="$2" mb="$3">
                  <ERC1155QuantitySelector
                    quantity={selectedQuantity}
                    maxQuantity={maxQuantity}
                    onQuantityChange={(newQuantity) => {
                      logger.info('[SendNFTScreen] ERC1155 quantity changed:', {
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
                dialogDescriptionSecondary={t('account.compatibility.dialog.descriptionSecondary')}
              />
            )}

            {/* Transaction Fee and Storage Warning Section */}
            <YStack gap="$3" mt={isMultipleNFTs ? 0 : -16}>
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
        <YStack pt="$2">
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
          transactionType={isMultipleNFTs ? 'multiple-nfts' : 'single-nft'}
          selectedToken={null}
          selectedNFTs={
            isMultipleNFTs
              ? nftsForUI
              : selectedNFT
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
        />
      </YStack>
    </BackgroundWrapper>
  );
}
