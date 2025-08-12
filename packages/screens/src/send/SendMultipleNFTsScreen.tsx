import {
  YStack,
  ScrollView,
  View,
  MultipleNFTsPreview,
  SendSectionHeader,
  SendArrowDivider,
  TransactionConfirmationModal,
  TransactionFeeSection,
  ToAccountSection,
  Text,
  type NFTSendData,
  type WalletAccount,
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
  showEditButtons?: boolean;
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
  showEditButtons = true,
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
    <YStack flex={1} bg={backgroundColor}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack p={contentPadding} gap="$4">
          {/* From Account Section */}
          {fromAccount && (
            <YStack bg="$gray1" rounded="$4" p="$4">
              <Text fontSize="$3" fontWeight="600" color="$gray11" mb="$2">
                From Account
              </Text>
              <Text fontSize="$4" fontWeight="600" color="$color">
                {fromAccount.name || fromAccount.address}
              </Text>
              {fromAccount.name && (
                <Text fontSize="$3" color="$gray11" mt="$1">
                  {fromAccount.address}
                </Text>
              )}
            </YStack>
          )}

          {/* NFTs Section */}
          {selectedNFTs && selectedNFTs.length > 0 && (
            <YStack bg="$gray1" rounded="$4" p="$4">
              <YStack gap="$3">
                {/* Section Header */}
                <SendSectionHeader
                  title={`Send NFTs (${selectedNFTs.length})`}
                  onEditPress={onEditNFTsPress}
                  showEditButton={showEditButtons}
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
            </YStack>
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
          <TransactionFeeSection transactionFee={transactionFee} />
        </YStack>
      </ScrollView>

      {/* Send Button */}
      <View p={contentPadding} pt="$2">
        <YStack
          bg={isSendDisabled ? '$gray8' : '$blue9'}
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
        onClose={onConfirmationClose}
        title="Confirm NFT Transfer"
      />
    </YStack>
  );
};
