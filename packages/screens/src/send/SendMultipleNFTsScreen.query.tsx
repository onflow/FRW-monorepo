import { bridge, navigation } from '@onflow/frw-context';
import { useSendStore, sendSelectors } from '@onflow/frw-stores';
import { type WalletAccount, type NFTModel } from '@onflow/frw-types';
import {
  BackgroundWrapper,
  YStack,
  ScrollView,
  View,
  MultipleNFTsPreview,
  SendArrowDivider,
  TransactionConfirmationModal,
  TransactionFeeSection,
  ToAccountSection,
  AccountCard,
  SendSectionHeader,
  StorageWarning,
  Text,
  ExtensionHeader,
  type NFTSendData,
  type TransactionFormData,
  XStack,
  Separator,
} from '@onflow/frw-ui';
import { logger, getNFTId } from '@onflow/frw-utils';
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
 * Transform NFTModel array to NFTSendData array for UI components
 */
const transformNFTsForUI = (nfts: NFTModel[]): NFTSendData[] => {
  return nfts.map((nft) => ({
    id: getNFTId(nft),
    name: nft.name || 'Untitled NFT',
    image: nft.image || nft.thumbnail || '',
    thumbnail: nft.thumbnail || nft.image || '',
    collection: nft.collectionName || nft.collection || 'Unknown Collection',
    collectionContractName: nft.collectionContractName || nft.contractName,
    // Add amount/token information from Figma design
    amount: nft.amount ? parseFloat(nft.amount).toLocaleString() : '1',
    // For fungible NFTs, show token count like in the design
    tokenInfo: nft.amount ? `${parseFloat(nft.amount).toLocaleString()} Tokens` : undefined,
    type: nft.type, // Pass the NFT type for EVM badge
  }));
};

/**
 * Query-integrated version of SendMultipleNFTsScreen following the established pattern
 * Uses TanStack Query for data fetching and caching
 * Matches Figma design: https://www.figma.com/design/ELsn1EA0ptswW1f21PZqWp/%F0%9F%9F%A2-Flow-Wallet?node-id=7491-12714&m=dev
 */
export function SendMultipleNFTsScreen(): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = bridge.getPlatform() === 'extension';
  const network = bridge.getNetwork() || 'mainnet';

  const cardBackgroundColor = '$light10';

  // Local state for confirmation modal
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  // Get data from send store using selectors
  const selectedNFTs = useSendStore(sendSelectors.selectedNFTs);
  const fromAccount = useSendStore(sendSelectors.fromAccount);
  const toAccount = useSendStore(sendSelectors.toAccount);
  const isLoading = useSendStore(sendSelectors.isLoading);
  const error = useSendStore(sendSelectors.error);
  const setCurrentStep = useSendStore((state) => state.setCurrentStep);
  const setSelectedNFTs = useSendStore((state) => state.setSelectedNFTs);
  const executeTransaction = useSendStore((state) => state.executeTransaction);

  // Update current step when screen loads
  useEffect(() => {
    setCurrentStep('send-multiple-nfts');
  }, [setCurrentStep]);

  // Transform NFT data for UI - following Figma design structure
  const nftsForUI: NFTSendData[] = useMemo(() => transformNFTsForUI(selectedNFTs), [selectedNFTs]);

  // Transform accounts for UI components
  const fromAccountForCard = useMemo(
    () => transformAccountForCard(fromAccount, '550.66 FLOW'), // TODO: Real balance
    [fromAccount]
  );

  // Event handlers
  const handleEditNFTsPress = useCallback(() => {
    navigation.goBack(); // Go back to NFT selection
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
      logger.error('[SendMultipleNFTsScreen] Transaction failed:', error);
      // Error handling will be managed by the store
    }
  }, [executeTransaction]);

  const handleRemoveNFT = useCallback(
    (nftId: string) => {
      const updatedNFTs = selectedNFTs.filter((nft) => getNFTId(nft) !== nftId);
      setSelectedNFTs(updatedNFTs);

      // If only one NFT remains, navigate to single NFT screen
      if (updatedNFTs.length === 1) {
        navigation.navigate('SendSingleNFT');
      }
      // If no NFTs remain, go back to selection
      else if (updatedNFTs.length === 0) {
        navigation.goBack();
      }
    },
    [selectedNFTs, setSelectedNFTs]
  );

  // Early return if essential data is missing
  if (!selectedNFTs || selectedNFTs.length === 0) {
    return (
      <BackgroundWrapper backgroundColor="$bgDrawer">
        <YStack flex={1} items="center" justify="center" px="$6">
          <Text fontSize="$6" fontWeight="600" color="$color" mb="$3" textAlign="center">
            {t('nft.notFound.title')}
          </Text>
          <Text fontSize="$4" color="$textSecondary" textAlign="center">
            No NFTs selected. Please go back and select NFTs to send.
          </Text>
        </YStack>
      </BackgroundWrapper>
    );
  }

  // Calculate if send button should be disabled
  const isSendDisabled =
    !selectedNFTs || selectedNFTs.length === 0 || !fromAccount || !toAccount || isLoading;

  // Mock transaction fee data - TODO: Replace with real fee calculation
  const transactionFee = '0.001';
  const usdFee = '0.00';
  const isFeesFree = true; // Following Figma design "Covered by Flow Wallet"

  // Mock storage warning - TODO: Replace with real storage check
  const showStorageWarning = false;
  const storageWarningMessage =
    'Account balance will fall below the minimum FLOW required for storage after this transaction.';

  // Create form data for transaction confirmation
  const formData: TransactionFormData = {
    tokenAmount: selectedNFTs.length.toString(),
    fiatAmount: '0.00',
    isTokenMode: true,
    transactionFee: `${transactionFee} FLOW`,
  };

  return (
    <BackgroundWrapper backgroundColor="$bgDrawer">
      <YStack flex={1}>
        {/* Extension Header - Following Figma design title "Sending" */}
        {isExtension && (
          <ExtensionHeader
            title={t('send.title')}
            help={true}
            onGoBack={() => navigation.goBack()}
            onNavigate={(link: string) => navigation.navigate(link)}
          />
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack bg={cardBackgroundColor} rounded="$4" p="$3" gap="$3">
            {/* From Account Section - Following Figma design */}
            {fromAccountForCard && (
              <AccountCard
                account={fromAccountForCard}
                title={t('send.fromAccount')}
                isLoading={false} // TODO: Real loading state
              />
            )}

            <Separator mx="$0" my="$0" borderColor="rgba(255, 255, 255, 0.1)" borderWidth={0.5} />

            {/* NFTs Section - Following Figma design with expandable list */}
            <YStack p="$4" gap="$3">
              <SendSectionHeader
                title={t('send.nfts')}
                onEditPress={handleEditNFTsPress}
                showEditButton={true}
                editButtonText="Edit"
              />

              {/* NFT Count Display - Following Figma design */}
              <YStack direction="row" justifyContent="space-between" alignItems="center" mb="$2">
                <Text fontSize="$5" fontWeight="500" color="rgba(255, 255, 255, 0.8)">
                  {selectedNFTs.length} NFT{selectedNFTs.length === 1 ? '' : 's'}
                </Text>
                {/* Expandable indicator would go here if needed */}
              </YStack>

              {/* NFTs List - Following Figma design structure */}
              <MultipleNFTsPreview
                nfts={nftsForUI}
                onRemoveNFT={handleRemoveNFT}
                maxVisibleThumbnails={4} // Following Figma design showing 4 NFTs
                expandable={true}
                showQuantityControls={true} // Following Figma design with +/- buttons
                backgroundColor="#141415" // Following Figma design dark background
              />
            </YStack>

            {/* Storage Warning */}
            {showStorageWarning && (
              <StorageWarning
                message={storageWarningMessage}
                showIcon={true}
                title="Storage warning"
                visible={true}
              />
            )}

            {/* Arrow Down Indicator */}
            <XStack position="relative" height={0}>
              <XStack width="100%" position="absolute" t={-30} justify="center">
                <SendArrowDivider variant="arrow" size={48} />
              </XStack>
            </XStack>

            {/* To Account Section - Following Figma design */}
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

            {/* Transaction Fee Section - Following Figma design "Covered by Flow Wallet" */}
            <TransactionFeeSection
              flowFee={transactionFee}
              usdFee={usdFee}
              isFree={isFeesFree}
              showCovered={true}
              coveredText="Covered by Flow Wallet"
              title={t('send.transactionFee')}
              backgroundColor="transparent"
              borderRadius={16}
              contentPadding={0}
            />
          </YStack>
        </ScrollView>

        {/* Send Button - Following Figma design "Next" */}
        <View p={20} pt="$2">
          <YStack
            bg={isSendDisabled ? '#6b7280' : '#FFFFFF'}
            rounded="$4"
            p="$4"
            items="center"
            opacity={isSendDisabled ? 0.7 : 1}
            pressStyle={{ opacity: 0.8 }}
            onPress={isSendDisabled ? undefined : handleSendPress}
            cursor={isSendDisabled ? 'not-allowed' : 'pointer'}
            style={{
              height: 52,
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
            }}
          >
            <Text
              data-testid="next"
              fontSize="$4"
              fontWeight="600"
              color={isSendDisabled ? '#999' : '#000000'}
            >
              {t('common.next')}
            </Text>
          </YStack>
        </View>

        {/* Transaction Confirmation Modal */}
        <TransactionConfirmationModal
          visible={isConfirmationVisible}
          transactionType="nfts"
          selectedToken={null}
          fromAccount={fromAccount}
          toAccount={toAccount}
          formData={formData}
          onConfirm={handleTransactionConfirm}
          onClose={handleConfirmationClose}
          title="Confirm NFT Transfer"
        />
      </YStack>
    </BackgroundWrapper>
  );
}
