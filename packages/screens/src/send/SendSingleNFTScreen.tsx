import {
  YStack,
  ScrollView,
  View,
  NFTSendPreview,
  SendArrowDivider,
  TransactionConfirmationModal,
  TransactionFeeSection,
  ToAccountSection,
  Text,
  type NFTDetailData,
  type WalletAccount,
  type TransactionFormData,
} from '@onflow/frw-ui';
import React from 'react';

export interface SendSingleNFTScreenProps {
  selectedNFT: NFTDetailData | null;
  fromAccount: WalletAccount | null;
  toAccount: WalletAccount | null;
  isConfirmationVisible?: boolean;
  isAccountIncompatible?: boolean;
  onEditNFTPress?: () => void;
  onEditAccountPress?: () => void;
  onLearnMorePress?: () => void;
  onSendPress?: () => void;
  onConfirmationClose?: () => void;
  onTransactionConfirm?: () => Promise<void>;
  backgroundColor?: string;
  contentPadding?: number;
  transactionFee?: string;
  showEditButtons?: boolean;
}

export const SendSingleNFTScreen: React.FC<SendSingleNFTScreenProps> = ({
  selectedNFT,
  fromAccount,
  toAccount,
  isConfirmationVisible = false,
  isAccountIncompatible = false,
  onEditNFTPress,
  onEditAccountPress,
  onLearnMorePress,
  onSendPress,
  onConfirmationClose,
  onTransactionConfirm,
  backgroundColor = '$background',
  contentPadding = 20,
  transactionFee = '0.001 FLOW',
  showEditButtons = true,
}) => {
  // Calculate if send button should be disabled
  const isSendDisabled = !selectedNFT || !fromAccount || !toAccount;

  // Create form data for transaction confirmation
  const formData: TransactionFormData = {
    tokenAmount: '1',
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

          {/* NFT Section */}
          {selectedNFT && (
            <NFTSendPreview
              nft={{
                id: selectedNFT.id,
                name: selectedNFT.name,
                image: selectedNFT.image,
                collection: selectedNFT.collection,
                collectionContractName: selectedNFT.collectionContractName,
                description: selectedNFT.description,
              }}
              onEditPress={onEditNFTPress}
              showEditButton={showEditButtons}
              sectionTitle="Send NFT"
              backgroundColor="$gray1"
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
            Send NFT
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
