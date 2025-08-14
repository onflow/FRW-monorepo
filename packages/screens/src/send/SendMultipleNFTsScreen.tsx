import { type WalletAccount } from '@onflow/frw-types';
import {
  BackgroundWrapper,
  YStack,
  ScrollView,
  View,
  MultipleNFTsPreview,
  SendSectionHeader,
  SendArrowDivider,
  TransactionConfirmationModal,
  TransactionFeeSection,
  ToAccountSection,
  AccountCard,
  StorageWarning,
  Text,
  type NFTSendData,
  type TransactionFormData,
} from '@onflow/frw-ui';
import React from 'react';

export interface SendMultipleNFTsScreenProps {
  selectedNFTs: NFTSendData[];
  fromAccount: WalletAccount | null;
  toAccount: WalletAccount | null;
  isConfirmationVisible?: boolean;
  isAccountIncompatible?: boolean;
  onEditNFTsPress?: () => void;
  onEditAccountPress?: () => void;
  onLearnMorePress?: () => void;
  onRemoveNFT?: (nftId: string) => void;
  onSendPress?: () => void;
  onConfirmationClose?: () => void;
  onTransactionConfirm?: () => Promise<void>;
  backgroundColor?: string;
  contentPadding?: number;
  transactionFee?: string;
  usdFee?: string;
  showEditButtons?: boolean;
  // New props for enhanced components
  isBalanceLoading?: boolean;
  showStorageWarning?: boolean;
  storageWarningMessage?: string;
  isFeesFree?: boolean;
}

export const SendMultipleNFTsScreen: React.FC<SendMultipleNFTsScreenProps> = ({
  selectedNFTs,
  fromAccount,
  toAccount,
  isConfirmationVisible = false,
  isAccountIncompatible = false,
  onEditNFTsPress,
  onEditAccountPress,
  onLearnMorePress,
  onRemoveNFT,
  onSendPress,
  onConfirmationClose,
  onTransactionConfirm,
  backgroundColor = '$background',
  contentPadding = 20,
  transactionFee = '0.001 FLOW',
  usdFee = '$0.02',
  showEditButtons = true,
  // New props
  isBalanceLoading = false,
  showStorageWarning = false,
  storageWarningMessage = 'Account balance will fall below the minimum FLOW required for storage after this transaction.',
  isFeesFree = false,
}) => {
  // Calculate if send button should be disabled
  const isSendDisabled = !selectedNFTs || selectedNFTs.length === 0 || !fromAccount || !toAccount;

  // Create form data for transaction confirmation
  const formData: TransactionFormData = {
    tokenAmount: selectedNFTs.length.toString(),
    fiatAmount: '0.00',
    isTokenMode: true,
    transactionFee,
  };

  return (
    <BackgroundWrapper backgroundColor={backgroundColor}>
      <YStack flex={1}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack p={contentPadding} gap="$4">
            {/* From Account Section */}
            {fromAccount && (
              <AccountCard
                account={fromAccount}
                title="From Account"
                isLoading={isBalanceLoading}
              />
            )}

            {/* NFTs Section */}
            {selectedNFTs && selectedNFTs.length > 0 && (
              <YStack bg="rgba(255, 255, 255, 0.1)" rounded="$4" p="$4" gap="$3">
                {/* Section Header */}
                <SendSectionHeader
                  title={`Send NFTs (${selectedNFTs.length})`}
                  onEditPress={onEditNFTsPress}
                  showEditButton={showEditButtons && !!onEditNFTsPress}
                  editButtonText="Edit"
                />

                {/* NFTs Preview */}
                <MultipleNFTsPreview
                  nfts={selectedNFTs}
                  onRemoveNFT={onRemoveNFT}
                  maxVisibleThumbnails={3}
                  expandable={true}
                />
              </YStack>
            )}

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
            <SendArrowDivider variant="text" />

            {/* To Account Section */}
            {toAccount && (
              <ToAccountSection
                account={toAccount}
                isAccountIncompatible={isAccountIncompatible}
                onEditPress={onEditAccountPress}
                onLearnMorePress={onLearnMorePress}
                showEditButton={showEditButtons}
              />
            )}

            {/* Transaction Fee Section */}
            <TransactionFeeSection
              flowFee={transactionFee}
              usdFee={usdFee}
              isFree={isFeesFree}
              showCovered={true}
              title="Transaction Fee"
              backgroundColor="rgba(255, 255, 255, 0.1)"
              borderRadius={16}
              contentPadding={16}
            />
          </YStack>
        </ScrollView>

        {/* Send Button */}
        <View p={contentPadding} pt="$2">
          <YStack
            bg={isSendDisabled ? 'rgba(255, 255, 255, 0.2)' : '#007AFF'}
            rounded="$4"
            p="$4"
            items="center"
            opacity={isSendDisabled ? 0.5 : 1}
            pressStyle={{ opacity: 0.8 }}
            onPress={isSendDisabled ? undefined : onSendPress}
            cursor={isSendDisabled ? 'not-allowed' : 'pointer'}
          >
            <Text fontSize="$4" fontWeight="600" color="$white">
              Send {selectedNFTs.length} NFT{selectedNFTs.length !== 1 ? 's' : ''}
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
          onConfirm={onTransactionConfirm}
          onClose={onConfirmationClose || (() => {})}
          title="Confirm NFT Transfer"
        />
      </YStack>
    </BackgroundWrapper>
  );
};
