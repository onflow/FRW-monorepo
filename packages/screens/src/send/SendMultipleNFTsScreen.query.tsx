import { bridge, navigation } from '@onflow/frw-context';
import { Platform } from '@onflow/frw-types';
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

import type { ScreenAssets } from '../assets/images';

interface SendMultipleNFTsScreenProps {
  assets?: ScreenAssets;
}

/**
 * Query-integrated version of SendMultipleNFTsScreen following the established pattern
 * Uses TanStack Query for data fetching and caching
 */
export function SendMultipleNFTsScreen({ assets }: SendMultipleNFTsScreenProps = {}): React.ReactElement {
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

  // Query for complete account information including storage and balance
  const { data: accountInfo } = useQuery({
    queryKey: storageQueryKeys.accountInfo(fromAccount || null),
    queryFn: () => storageQueries.fetchAccountInfo(fromAccount || null),
    enabled: !!fromAccount?.address,
    staleTime: 0, // Always fresh for financial data
  });

  // Query for resource compatibility check (multiple NFTs - use first NFT's identifier)
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

  // Transform NFT data for UI - following Figma design structure
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
  // Mock transaction fee data - TODO: Replace with real fee calculation
  const transactionFee = '0.001';
  const usdFee = '0.00';
  const isFeesFree = true; // Following Figma design "Covered by Flow Wallet"

  // Calculate storage warning state based on account validation for multiple NFT transfer
  const validationResult = useMemo(() => {
    if (!accountInfo) {
      return { canProceed: true, showWarning: false, warningType: null };
    }
    // Multiple NFT transfers are treated as "other" transactions (non-FLOW)
    return storageUtils.validateOtherTransaction(accountInfo, isFeesFree);
  }, [accountInfo, isFeesFree]);

  const showStorageWarning = validationResult.showWarning;
  const storageWarningMessage = useMemo(() => {
    return storageUtils.getStorageWarningMessage(validationResult.warningType);
  }, [validationResult.warningType, accountInfo]);

  // Calculate if send button should be disabled
  const isSendDisabled =
    !selectedNFTs ||
    selectedNFTs.length === 0 ||
    !fromAccount ||
    !toAccount ||
    isLoading ||
    !validationResult.canProceed ||
    isAccountIncompatible;

  // Event handlers
  const handleEditNFTsPress = useCallback(() => {
    // Navigate back to NFT selection screen
    navigation.navigate('NFTList');
  }, []);

  const handleEditAccountPress = useCallback(() => {
    navigation.navigate('SendTo'); // Go back to account selection
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
      const result = await executeTransaction();

      // Close the React Native view after successful transaction
      const platform = bridge.getPlatform();
      if (result && (platform === Platform.iOS || platform === Platform.Android)) {
        bridge.closeRN();
      }
      // Navigation after successful transaction will be handled by the store
    } catch (error) {
      logger.error('[SendMultipleNFTsScreen] Transaction failed:', error);
      // Error handling will be managed by the store
    }
  }, [executeTransaction, isExtension]);

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
        // Default to enabled if we can't determine the status
        setIsFreeGasEnabled(true);
      }
    };

    checkFreeGasStatus();
  }, []);

  // Create form data for transaction confirmation
  const formData: TransactionFormData = {
    tokenAmount: selectedNFTs?.length.toString() || '0',
    fiatAmount: '0.00',
    isTokenMode: true,
    transactionFee,
  };

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
                <View mb={-18}>
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
              <View mt={8} pb={16} mb={-8}>
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
              <View mt={-4}>
                <ToAccountSection
                  account={toAccount}
                  title={t('send.toAccount')}
                  isAccountIncompatible={isAccountIncompatible} // TODO: Real compatibility check
                  onEditPress={handleEditAccountPress}
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
          transactionType="multiple-nfts"
          selectedToken={null}
          sendStaticImage={assets?.sendStaticImage}
          selectedNFTs={nftsForUI}
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
